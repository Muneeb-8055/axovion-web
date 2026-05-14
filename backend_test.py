"""Comprehensive backend API tests for Axovion.io"""
import requests
import sys
import time
import uuid
from datetime import datetime

BASE_URL = "https://agency-launch-demo.preview.emergentagent.com/api"

class AxovionAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_audit_id = None
        self.test_session_id = str(uuid.uuid4())
        self.test_booking_id = None
        self.test_task_id = None

    def log(self, msg, level="INFO"):
        print(f"[{level}] {msg}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        self.log(f"Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"✅ {name} - Status: {response.status_code}", "PASS")
                return True, response.json() if response.text else {}
            else:
                self.log(f"❌ {name} - Expected {expected_status}, got {response.status_code}", "FAIL")
                self.log(f"Response: {response.text[:200]}", "FAIL")
                return False, {}

        except Exception as e:
            self.log(f"❌ {name} - Error: {str(e)}", "FAIL")
            return False, {}

    def test_health(self):
        """Test health endpoints"""
        self.log("\n=== HEALTH CHECKS ===")
        self.run_test("Root endpoint", "GET", "", 200)
        self.run_test("Health endpoint", "GET", "health", 200)

    def test_auth(self):
        """Test authentication"""
        self.log("\n=== AUTHENTICATION ===")
        
        # Test login with correct credentials
        success, response = self.run_test(
            "Admin login",
            "POST",
            "auth/login",
            200,
            data={"email": "admin@axovion.io", "password": "AxovionAdmin2025!"}
        )
        if success and 'token' in response:
            self.token = response['token']
            self.log(f"Token obtained: {self.token[:20]}...", "INFO")
        else:
            self.log("Failed to obtain token - admin endpoints will fail", "WARN")
            return False

        # Test /me endpoint
        self.run_test("Get current user", "GET", "auth/me", 200)
        
        return True

    def test_audit_flow(self):
        """Test audit submission and report generation"""
        self.log("\n=== AUDIT FLOW ===")
        
        # Submit audit
        audit_data = {
            "businessName": f"Test Business {uuid.uuid4().hex[:8]}",
            "industry": "E-commerce",
            "websiteUrl": "https://testbusiness.com",
            "contactEmail": f"test{uuid.uuid4().hex[:8]}@example.com",
            "contactName": "Test User",
            "whatsapp": "+1234567890",
            "mainGoal": "Automate customer support",
            "monthlyRevenue": "$50,000-$100,000",
            "employees": 10,
            "repetitiveTasks": "Customer support, order processing",
            "tools": ["Shopify", "Zendesk"],
            "supportVolume": "100-500 tickets/month",
            "leadsPerMonth": "500-1000",
            "bottleneck": "Manual customer support responses",
            "budget": "$5,000-$10,000",
            "timeline": "1-3 months",
            "salesCycleLength": "1-2 weeks",
            "currentAutomationLevel": "Basic email automation"
        }
        
        success, response = self.run_test(
            "Submit audit",
            "POST",
            "audit",
            200,
            data=audit_data
        )
        
        if success and 'id' in response:
            self.test_audit_id = response['id']
            self.log(f"Audit ID: {self.test_audit_id}", "INFO")
            
            # Wait for report generation (15-30 seconds expected)
            self.log("Waiting 20 seconds for report generation...", "INFO")
            time.sleep(20)
            
            # Get audit report
            success, report_response = self.run_test(
                "Get audit report",
                "GET",
                f"audit/report/{self.test_audit_id}",
                200
            )
            
            if success:
                report = report_response.get('report', {})
                if report and 'opportunities' in report:
                    self.log(f"✅ Report generated with {len(report.get('opportunities', []))} opportunities", "PASS")
                else:
                    self.log("⚠️ Report not yet generated or incomplete", "WARN")
        else:
            self.log("Failed to submit audit", "FAIL")

    def test_admin_audits(self):
        """Test admin audit endpoints"""
        if not self.token:
            self.log("Skipping admin audit tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN AUDIT ENDPOINTS ===")
        
        # List audits
        self.run_test("List all audits", "GET", "audits", 200)
        
        # Get specific audit (if we have one)
        if self.test_audit_id:
            self.run_test(
                "Get audit detail",
                "GET",
                f"audits/{self.test_audit_id}",
                200
            )
            
            # Update audit status
            self.run_test(
                "Update audit status",
                "PUT",
                f"audits/{self.test_audit_id}",
                200,
                data={"status": "in-progress", "notes": "Test note"}
            )

    def test_chatbot(self):
        """Test chatbot functionality"""
        self.log("\n=== CHATBOT ===")
        
        # Send chat message
        success, response = self.run_test(
            "Send chat message",
            "POST",
            "chat",
            200,
            data={
                "sessionId": self.test_session_id,
                "message": "What services do you offer?",
                "contactEmail": "test@example.com",
                "contactName": "Test User"
            }
        )
        
        if success and 'reply' in response:
            self.log(f"AI Reply: {response['reply'][:100]}...", "INFO")
        
        # Get chat thread
        self.run_test(
            "Get chat thread",
            "GET",
            f"chat/{self.test_session_id}",
            200
        )

    def test_booking(self):
        """Test booking functionality"""
        self.log("\n=== BOOKING ===")
        
        # Create booking
        success, response = self.run_test(
            "Create booking",
            "POST",
            "booking",
            200,
            data={
                "name": "Test User",
                "email": f"test{uuid.uuid4().hex[:8]}@example.com",
                "phone": "+1234567890",
                "message": "I want to book a consultation",
                "preferredTime": "Next week",
                "source": "contact-form"
            }
        )
        
        if success and 'id' in response:
            self.test_booking_id = response['id']

    def test_admin_bookings(self):
        """Test admin booking endpoints"""
        if not self.token:
            self.log("Skipping admin booking tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN BOOKING ENDPOINTS ===")
        
        # List bookings
        self.run_test("List bookings", "GET", "bookings", 200)
        
        # Update booking status (if we have one)
        if self.test_booking_id:
            self.run_test(
                "Update booking status",
                "PUT",
                f"bookings/{self.test_booking_id}?status=confirmed",
                200
            )

    def test_newsletter(self):
        """Test newsletter signup"""
        self.log("\n=== NEWSLETTER ===")
        
        self.run_test(
            "Newsletter signup",
            "POST",
            "newsletter",
            200,
            data={
                "email": f"test{uuid.uuid4().hex[:8]}@example.com",
                "source": "blog"
            }
        )

    def test_admin_tasks(self):
        """Test admin task management"""
        if not self.token:
            self.log("Skipping admin task tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN TASKS ===")
        
        # Create task
        success, response = self.run_test(
            "Create task",
            "POST",
            "tasks",
            200,
            data={
                "title": "Test Task",
                "description": "This is a test task",
                "status": "todo",
                "priority": "medium"
            }
        )
        
        if success and 'id' in response:
            self.test_task_id = response['id']
            
            # List tasks
            self.run_test("List tasks", "GET", "tasks", 200)
            
            # Update task
            self.run_test(
                "Update task",
                "PUT",
                f"tasks/{self.test_task_id}",
                200,
                data={
                    "title": "Updated Test Task",
                    "status": "in-progress"
                }
            )

    def test_admin_chats(self):
        """Test admin chat endpoints"""
        if not self.token:
            self.log("Skipping admin chat tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN CHAT ENDPOINTS ===")
        
        # List chats
        self.run_test("List chats", "GET", "chats", 200)

    def test_admin_analytics(self):
        """Test admin analytics endpoints"""
        if not self.token:
            self.log("Skipping admin analytics tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN ANALYTICS ===")
        
        self.run_test("Dashboard stats", "GET", "analytics/dashboard", 200)
        self.run_test("Funnel data", "GET", "analytics/funnel", 200)
        self.run_test("Timeseries data", "GET", "analytics/timeseries", 200)
        self.run_test("Traffic sources", "GET", "analytics/sources", 200)

    def test_settings(self):
        """Test settings endpoints"""
        self.log("\n=== SETTINGS ===")
        
        # Public settings
        self.run_test("Get public settings", "GET", "settings", 200)
        
        # Admin settings
        if self.token:
            self.run_test("Get admin settings", "GET", "settings/admin", 200)

    def test_admin_calls(self):
        """Test admin call endpoints"""
        if not self.token:
            self.log("Skipping admin call tests - no token", "WARN")
            return
            
        self.log("\n=== ADMIN CALLS ===")
        
        # List calls
        self.run_test("List call logs", "GET", "calls", 200)
        
        # Health check
        self.run_test("Calls health check", "GET", "calls/health", 200)
        
        # List Retell agents
        self.run_test("List Retell agents", "GET", "calls/agents/retell", 200)

    def run_all_tests(self):
        """Run all tests in sequence"""
        self.log("=" * 60)
        self.log("STARTING AXOVION.IO BACKEND API TESTS")
        self.log("=" * 60)
        
        # Basic health checks
        self.test_health()
        
        # Auth (required for admin endpoints)
        auth_success = self.test_auth()
        
        # Public endpoints
        self.test_audit_flow()
        self.test_chatbot()
        self.test_booking()
        self.test_newsletter()
        self.test_settings()
        
        # Admin endpoints (require auth)
        if auth_success:
            self.test_admin_audits()
            self.test_admin_bookings()
            self.test_admin_tasks()
            self.test_admin_chats()
            self.test_admin_analytics()
            self.test_admin_calls()
        
        # Print summary
        self.log("\n" + "=" * 60)
        self.log("TEST SUMMARY")
        self.log("=" * 60)
        self.log(f"Tests Run: {self.tests_run}")
        self.log(f"Tests Passed: {self.tests_passed}")
        self.log(f"Tests Failed: {self.tests_run - self.tests_passed}")
        self.log(f"Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        self.log("=" * 60)
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = AxovionAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())

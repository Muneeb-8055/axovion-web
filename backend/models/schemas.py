"""Pydantic models for Axovion.io backend."""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any, Literal
from datetime import datetime, timezone
import uuid


def _now():
    return datetime.now(timezone.utc)


# ============ AUDIT ============
class AuditSubmitInput(BaseModel):
    """Public audit form submission."""
    businessName: str
    industry: str
    websiteUrl: str
    contactEmail: EmailStr
    contactName: Optional[str] = None
    whatsapp: Optional[str] = None
    mainGoal: str
    monthlyRevenue: Optional[str] = None
    employees: Optional[int] = None
    repetitiveTasks: Optional[str] = None
    tools: Optional[List[str]] = []
    supportVolume: Optional[str] = None
    leadsPerMonth: Optional[str] = None
    bottleneck: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    salesCycleLength: Optional[str] = None
    currentAutomationLevel: Optional[str] = None


class AuditReport(BaseModel):
    executive_summary: str = ""
    opportunities: List[Dict[str, Any]] = []
    total_monthly_savings_usd: float = 0
    total_hours_saved_per_month: float = 0
    recommended_agents: List[Dict[str, Any]] = []
    workflow_map: List[Dict[str, Any]] = []
    implementation_timeline_days: int = 0
    priority_ranking: List[str] = []
    generated_at: Optional[str] = None
    model_used: Optional[str] = None


class Audit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    businessName: str
    industry: str
    websiteUrl: str
    contactEmail: str
    contactName: Optional[str] = None
    whatsapp: Optional[str] = None
    mainGoal: str
    monthlyRevenue: Optional[str] = None
    employees: Optional[int] = None
    repetitiveTasks: Optional[str] = None
    tools: List[str] = []
    supportVolume: Optional[str] = None
    leadsPerMonth: Optional[str] = None
    bottleneck: Optional[str] = None
    budget: Optional[str] = None
    timeline: Optional[str] = None
    salesCycleLength: Optional[str] = None
    currentAutomationLevel: Optional[str] = None
    status: Literal["new", "in-progress", "delivered", "closed"] = "new"
    lead_score: Literal["hot", "warm", "cold"] = "warm"
    report: Optional[AuditReport] = None
    notes: Optional[str] = None
    createdAt: datetime = Field(default_factory=_now)
    updatedAt: datetime = Field(default_factory=_now)


class AuditStatusUpdate(BaseModel):
    status: Literal["new", "in-progress", "delivered", "closed"]
    notes: Optional[str] = None


# ============ CHAT ============
class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=_now)


class ChatSendInput(BaseModel):
    sessionId: str
    message: str
    contactEmail: Optional[str] = None
    contactName: Optional[str] = None


class ChatThread(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sessionId: str
    messages: List[ChatMessage] = []
    contactEmail: Optional[str] = None
    contactName: Optional[str] = None
    leadScore: int = 0
    createdAt: datetime = Field(default_factory=_now)
    updatedAt: datetime = Field(default_factory=_now)


# ============ BOOKING ============
class BookingInput(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    message: Optional[str] = None
    preferredTime: Optional[str] = None
    source: Literal["calendly", "chatbot", "contact-form"] = "contact-form"


class Booking(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    phone: Optional[str] = None
    message: Optional[str] = None
    preferredTime: Optional[str] = None
    source: str = "contact-form"
    status: Literal["new", "confirmed", "completed", "cancelled"] = "new"
    createdAt: datetime = Field(default_factory=_now)


# ============ TASK (Kanban) ============
class TaskInput(BaseModel):
    title: str
    description: Optional[str] = ""
    status: Literal["todo", "in-progress", "review", "done"] = "todo"
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    assignee: Optional[str] = None
    relatedAuditId: Optional[str] = None
    dueDate: Optional[str] = None
    labels: List[str] = []


class Task(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str = ""
    status: Literal["todo", "in-progress", "review", "done"] = "todo"
    priority: Literal["low", "medium", "high", "urgent"] = "medium"
    assignee: Optional[str] = None
    relatedAuditId: Optional[str] = None
    dueDate: Optional[str] = None
    labels: List[str] = []
    createdAt: datetime = Field(default_factory=_now)
    updatedAt: datetime = Field(default_factory=_now)


# ============ EMAIL LOG ============
class EmailLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    auditId: Optional[str] = None
    template: str
    toEmail: str
    subject: str
    status: Literal["sent", "failed", "queued"] = "sent"
    providerEmailId: Optional[str] = None
    error: Optional[str] = None
    sentAt: datetime = Field(default_factory=_now)


class EmailSendInput(BaseModel):
    to: EmailStr
    subject: str
    html: str
    template: Optional[str] = "manual"
    auditId: Optional[str] = None


# ============ CALL LOG ============
class CallTriggerInput(BaseModel):
    auditId: str
    phone: str
    provider: Literal["retell", "vapi"] = "retell"


class CallLog(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    auditId: Optional[str] = None
    leadName: str
    phone: str
    provider: Literal["vapi", "retell"] = "retell"
    status: Literal["scheduled", "in-progress", "completed", "failed", "no-answer"] = "scheduled"
    outcome: Optional[str] = None
    recordingUrl: Optional[str] = None
    transcript: Optional[str] = None
    providerCallId: Optional[str] = None
    scheduledAt: datetime = Field(default_factory=_now)
    completedAt: Optional[datetime] = None
    retryCount: int = 0
    error: Optional[str] = None


# ============ NEWSLETTER ============
class NewsletterInput(BaseModel):
    email: EmailStr
    source: Optional[str] = "blog"


# ============ AUTH ============
class LoginInput(BaseModel):
    email: str
    password: str


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    role: Literal["admin", "sales", "developer"] = "admin"
    createdAt: datetime = Field(default_factory=_now)


# ============ SETTINGS ============
class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "global"
    businessName: str = "Axovion.io"
    contactEmail: str = "hello@axovion.io"
    whatsapp: str = ""
    calendlyLink: str = "https://calendly.com/axovion/30min"
    chatbotSystemPrompt: Optional[str] = None
    emailFromName: str = "Axovion AI"
    emailFromAddress: str = "onboarding@resend.dev"
    highValueRevenueUsd: int = 50000
    highValueBudgetUsd: int = 5000
    autoCallEnabled: bool = False
    autoEmailEnabled: bool = True
    updatedAt: datetime = Field(default_factory=_now)

"""Retell + Vapi calling services."""
import os
import httpx
from typing import Optional, Dict, Any

RETELL_API_KEY = os.environ["RETELL_API_KEY"]
VAPI_API_KEY = os.environ["VAPI_API_KEY"]
RETELL_BASE = "https://api.retellai.com"
VAPI_BASE = "https://api.vapi.ai"


async def retell_list_agents() -> list:
    """List available Retell agents."""
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.get(
                f"{RETELL_BASE}/list-agents",
                headers={"Authorization": f"Bearer {RETELL_API_KEY}"},
            )
            if r.status_code == 200:
                return r.json() if isinstance(r.json(), list) else []
        return []
    except Exception:
        return []


async def retell_create_phone_call(
    agent_id: str,
    from_number: str,
    to_number: str,
    metadata: Optional[Dict[str, Any]] = None,
    dynamic_vars: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create an outbound phone call via Retell."""
    payload = {
        "from_number": from_number,
        "to_number": to_number,
        "override_agent_id": agent_id,
    }
    if metadata:
        payload["metadata"] = metadata
    if dynamic_vars:
        payload["retell_llm_dynamic_variables"] = dynamic_vars

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{RETELL_BASE}/create-phone-call",
                headers={
                    "Authorization": f"Bearer {RETELL_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if r.status_code in (200, 201):
                return {"ok": True, "data": r.json()}
            return {"ok": False, "error": f"HTTP {r.status_code}: {r.text[:300]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


async def vapi_create_call(
    assistant_id: str,
    phone_number_id: str,
    customer_number: str,
    customer_name: Optional[str] = None,
    variables: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Create an outbound call via Vapi."""
    payload = {
        "assistantId": assistant_id,
        "phoneNumberId": phone_number_id,
        "customer": {"number": customer_number, "name": customer_name or "Lead"},
    }
    if variables:
        payload["assistantOverrides"] = {"variableValues": variables}
    try:
        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                f"{VAPI_BASE}/call",
                headers={
                    "Authorization": f"Bearer {VAPI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            if r.status_code in (200, 201):
                return {"ok": True, "data": r.json()}
            return {"ok": False, "error": f"HTTP {r.status_code}: {r.text[:300]}"}
    except Exception as e:
        return {"ok": False, "error": str(e)}


async def health_check() -> Dict[str, bool]:
    """Quick health check for both providers."""
    out = {"retell": False, "vapi": False}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{RETELL_BASE}/list-agents",
                headers={"Authorization": f"Bearer {RETELL_API_KEY}"},
            )
            out["retell"] = r.status_code == 200
    except Exception:
        pass
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(
                f"{VAPI_BASE}/assistant",
                headers={"Authorization": f"Bearer {VAPI_API_KEY}"},
                params={"limit": 1},
            )
            out["vapi"] = r.status_code == 200
    except Exception:
        pass
    return out

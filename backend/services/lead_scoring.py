"""Lead scoring service."""
import re
from typing import Dict, Any, Literal


def _parse_revenue(val: str) -> float:
    if not val:
        return 0
    val = str(val).lower().replace("$", "").replace(",", "").strip()
    multiplier = 1
    if "k" in val:
        multiplier = 1_000
        val = val.replace("k", "")
    elif "m" in val:
        multiplier = 1_000_000
        val = val.replace("m", "")
    # Take first number found
    m = re.search(r"([\d.]+)", val)
    if not m:
        return 0
    try:
        return float(m.group(1)) * multiplier
    except Exception:
        return 0


def score_lead(audit_data: Dict[str, Any], high_value_revenue: float = 50000, high_value_budget: float = 5000) -> Literal["hot", "warm", "cold"]:
    """Score lead based on revenue, budget, and engagement signals."""
    score = 0
    revenue = _parse_revenue(audit_data.get("monthlyRevenue", "") or "")
    budget = _parse_revenue(audit_data.get("budget", "") or "")

    # Revenue tier
    if revenue >= high_value_revenue * 2:
        score += 4
    elif revenue >= high_value_revenue:
        score += 3
    elif revenue >= high_value_revenue / 2:
        score += 1

    # Budget tier
    if budget >= high_value_budget * 2:
        score += 4
    elif budget >= high_value_budget:
        score += 3
    elif budget >= high_value_budget / 2:
        score += 1

    # Has bottleneck described
    if audit_data.get("bottleneck") and len(audit_data.get("bottleneck", "")) > 30:
        score += 1

    # Has tools listed
    if audit_data.get("tools") and len(audit_data.get("tools", [])) > 0:
        score += 1

    # Has clear timeline
    timeline = (audit_data.get("timeline") or "").lower()
    if "asap" in timeline or "week" in timeline or "month" in timeline:
        score += 1

    # Employee count
    employees = audit_data.get("employees") or 0
    try:
        employees = int(employees) if employees else 0
    except Exception:
        employees = 0
    if employees >= 20:
        score += 2
    elif employees >= 5:
        score += 1

    if score >= 6:
        return "hot"
    if score >= 3:
        return "warm"
    return "cold"


def is_high_value(audit_data: Dict[str, Any], high_value_revenue: float = 50000, high_value_budget: float = 5000) -> bool:
    revenue = _parse_revenue(audit_data.get("monthlyRevenue", "") or "")
    budget = _parse_revenue(audit_data.get("budget", "") or "")
    return revenue >= high_value_revenue or budget >= high_value_budget

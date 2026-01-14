import re
from typing import Tuple, List, Optional

def normalize_rate(raw_text: str) -> Tuple[Optional[float], List[str], List[str]]:
    """
    Returns:
    - normalized_rate
    - modifiers
    - issues
    """

    if not raw_text:
        return None, [], ["EMPTY_RATE"]

    text = raw_text.lower()
    modifiers = []
    issues = []

    # Extract all numbers
    numbers = re.findall(r"\d+\.?\d*", text)
    numbers = [float(n) for n in numbers]

    if not numbers:
        return None, [], ["NO_NUMERIC_VALUE"]

    # Detect add-ons
    if "+" in text:
        modifiers.append("ADD_ON")

    if "after hours" in text:
        modifiers.append("AFTER_HOURS")

    if "t" in text or "temp" in text:
        issues.append("AMBIGUOUS_RATE_TEXT")

    normalized_rate = sum(numbers)

    return normalized_rate, modifiers, issues

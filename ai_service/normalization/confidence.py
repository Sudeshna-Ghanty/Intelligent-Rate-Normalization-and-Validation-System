def calculate_confidence(
    cpt_valid: bool,
    description_similarity: float,
    issues: list,
    modifiers: list
) -> float:

    score = 0.0

    if cpt_valid:
        score += 0.3

    score += min(description_similarity, 1.0) * 0.3

    if not issues:
        score += 0.3

    if modifiers:
        score -= 0.1

    return round(max(min(score, 1.0), 0.0), 2)


def determine_status(cpt_exists: bool, issues: list):
    # Remove CPT issue from manual consideration
    non_cpt_issues = [
        i for i in issues
        if not (isinstance(i, str) and i == "CPT_CODE_NOT_PRESENT_IN_THE_SYSTEM")
    ]

    if non_cpt_issues:
        return "MANUAL_INTERVENTION"

    if not cpt_exists:
        return "NEW"

    return "CLEAN"


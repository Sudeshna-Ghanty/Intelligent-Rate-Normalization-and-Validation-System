def compare_with_existing(parsed_rows, existing_rates):
    """
    Compares AI parsed rates with DB rates
    """

    comparison = []

    for row in parsed_rows:
        code = row["service_code"]
        ai_rate = row["ai_rate"]

        existing_rate = existing_rates.get(code)

        if existing_rate is None:
            status = "INVALID"
        elif existing_rate == ai_rate:
            status = "CLEAN"
        else:
            status = "AMBIGUOUS"

        comparison.append({
            "service_code": code,
            "description": row["description"],
            "existing_rate": existing_rate or 0,
            "ai_rate": ai_rate,
            "status": status
        })

    return comparison

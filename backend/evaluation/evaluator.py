def evaluate_bidder(bidder_data, criteria_data):
    results = {}
    
    # --- 🔹 FINANCIAL EVALUATION ---
    b_fin = bidder_data.get("financial", {})
    c_fin = criteria_data.get("financial", {})
    
    fin_results = {}
    
    # Turnover
    b_turnover = b_fin.get("avg_turnover")
    c_turnover = c_fin.get("turnover_min")
    if c_turnover:
        status = "Eligible" if (b_turnover and b_turnover >= c_turnover) else "Not Eligible"
        if not b_turnover: status = "Needs Review"
        fin_results["turnover"] = {
            "status": status,
            "value": b_turnover,
            "required": c_turnover,
            "reason": f"Bidder: {b_turnover}, Required: {c_turnover}"
        }

    # Net Worth
    b_nw = b_fin.get("net_worth")
    c_nw = c_fin.get("net_worth_min")
    if c_nw:
        status = "Eligible" if (b_nw and b_nw >= c_nw) else "Not Eligible"
        if not b_turnover: status = "Needs Review"
        fin_results["net_worth"] = {
            "status": status,
            "value": b_nw,
            "required": c_nw,
            "reason": f"Bidder: {b_nw}, Required: {c_nw}"
        }
    
    results["financial"] = fin_results

    # --- 🔹 TECHNICAL EVALUATION ---
    b_tech = bidder_data.get("technical", {})
    c_tech = criteria_data.get("technical", {})
    
    tech_results = {}
    
    # Projects
    b_projects = b_tech.get("projects_completed")
    c_projects = c_tech.get("projects_min")
    if c_projects:
        status = "Eligible" if (b_projects and b_projects >= c_projects) else "Not Eligible"
        if not b_projects: status = "Needs Review"
        tech_results["projects"] = {
            "status": status,
            "value": b_projects,
            "required": c_projects,
            "reason": f"Bidder: {b_projects}, Required: {c_projects}"
        }

    # Experience
    b_exp = b_tech.get("years_in_business")
    c_exp = c_tech.get("experience_years_min")
    if c_exp:
        status = "Eligible" if (b_exp and b_exp >= c_exp) else "Not Eligible"
        if not b_exp: status = "Needs Review"
        tech_results["experience"] = {
            "status": status,
            "value": b_exp,
            "required": c_exp,
            "reason": f"Bidder: {b_exp}, Required: {c_exp}"
        }

    # ISO
    b_iso = b_tech.get("has_iso")
    c_iso = c_tech.get("iso_required")
    if c_iso:
        tech_results["iso_certification"] = {
            "status": "Eligible" if b_iso else "Not Eligible",
            "value": "Yes" if b_iso else "No",
            "required": "Yes",
            "reason": "ISO 9001 required"
        }

    results["technical"] = tech_results

    # --- 🔹 COMPLIANCE EVALUATION ---
    b_comp = bidder_data.get("compliance", {})
    c_comp = criteria_data.get("compliance", {})
    
    comp_results = {}
    
    # GST
    if c_comp.get("gst_required"):
        gst = b_comp.get("gst_number")
        comp_results["gst"] = {
            "status": "Eligible" if gst else "Not Eligible",
            "value": gst,
            "required": "Required",
            "reason": "GST Registration"
        }
    
    # PAN
    if c_comp.get("pan_required"):
        pan = b_comp.get("pan_number")
        comp_results["pan"] = {
            "status": "Eligible" if pan else "Not Eligible",
            "value": pan,
            "required": "Required",
            "reason": "PAN Card"
        }
    
    results["compliance"] = comp_results

    return results

def final_decision(results):
    all_statuses = []
    for category in results.values():
        for item in category.values():
            all_statuses.append(item["status"])
    
    if "Not Eligible" in all_statuses:
        return "Not Eligible"
    if "Needs Review" in all_statuses:
        return "Needs Review"
    return "Eligible"
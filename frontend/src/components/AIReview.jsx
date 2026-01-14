import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function AIReview() {
  const location = useLocation();
  const uploadedFileUrl = location.state?.uploadedFileUrl || null;
const uploadedFileName = location.state?.uploadedFileName || "Uploaded File";

  const ratesFromState = (location.state?.rates || []).map(r => ({
  ...r,
  review_decision: "PENDING"
}));


  const [rates, setRates] = useState(ratesFromState);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  // ✅ NEW STATES FOR RATE SHEET
  const [submittedRates, setSubmittedRates] = useState([]);
  const [showRateSheet, setShowRateSheet] = useState(false);
 // BULK APPROVE/DENY
  const [selectedRows, setSelectedRows] = useState(new Set());
// view pdf 
const [showFileViewer, setShowFileViewer] = useState(false);
const getFileType = (url = "") => {
  if (url.endsWith(".pdf")) return "pdf";
  if (url.endsWith(".xls") || url.endsWith(".xlsx")) return "excel";
  return "unknown";
};

// checkbox toggle
  const toggleRowSelection = (serviceCode) => {
  setSelectedRows(prev => {
    const next = new Set(prev);
    next.has(serviceCode)
      ? next.delete(serviceCode)
      : next.add(serviceCode);
    return next;
  });
};

const clearSelection = () => {
  setSelectedRows(new Set());
};
 // BULK APPORVE/DENY HANDLERS
const handleBulkApprove = () => {
  if (selectedRows.size === 0) {
    alert("Please select at least one row.");
    return;
  }

  setRates(prev =>
    prev.map(r =>
      selectedRows.has(r.service_code)
        ? { ...r, review_decision: "APPROVED" }
        : r
    )
  );

  clearSelection();
};

const handleBulkDeny = () => {
  if (selectedRows.size === 0) {
    alert("Please select at least one row.");
    return;
  }

  setRates(prev =>
    prev.map(r =>
      selectedRows.has(r.service_code)
        ? { ...r, review_decision: "DENIED" }
        : r
    )
  );

  clearSelection();
};

  /* ---------- HELPERS ---------- */

  const confidenceColor = (value = 0) => {
    if (value >= 0.8) return "#22c55e";
    if (value >= 0.5) return "#f59e0b";
    return "#ef4444";
  };

  const statusBadge = (status, row) => {
  const map = {
    CLEAN: { bg: "#dcfce7", color: "#166534" },
    NEW: { bg: "#e0f2fe", color: "#075985" },
    MANUAL_INTERVENTION: { bg: "#ffedd5", color: "#9a3412" },
    AMBIGUOUS: { bg: "#fef3c7", color: "#92400e" }
  };

  const style = map[status] || map.AMBIGUOUS;

  const showEye =
    status === "MANUAL_INTERVENTION" || status === "NEW";

  return (
    <span
      style={{
        padding: "6px 12px",
        borderRadius: "14px",
        fontSize: "12px",
        fontWeight: "bold",
        background: style.bg,
        color: style.color,
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        whiteSpace: "nowrap"
      }}
    >
      {status === "MANUAL_INTERVENTION"
        ? "REVIEW PENDING"
        : status.replace("_", " ")}

      {showEye && row.issues?.length > 0 && (
        <button
          style={iconBtn}
          onClick={() => setSelectedIssue(row)}
        >
          👁
        </button>
      )}
    </span>
  );
};


  const handleEdit = (index, field, value) => {
    const updated = [...rates];
    updated[index][field] = value;
    setRates(updated);
  };

 const handleApprove = (row) => {
  setRates(prev =>
    prev.map(r =>
      r.service_code === row.service_code
        ? { ...r, review_decision: "APPROVED" }
        : r
    )
  );

  setIsModalVisible(true);
  setIsDenied(false);

  setTimeout(() => {
    // alert(`Accepted rate for CPT ${row.service_code}`);
  }, 400);
};

const handleDeny = (row) => {
  setRates(prev =>
    prev.map(r =>
      r.service_code === row.service_code
        ? { ...r, review_decision: "DENIED" }
        : r
    )
  );

  setIsModalVisible(true);
  setIsDenied(true);

  setTimeout(() => {
    // alert("RATE REJECT - NO CHANGES TO DB");
  }, 400);
};


  const handleModalClose = () => {
    setSelectedIssue(null);
    setIsModalVisible(false);
  };


  const confidenceLabel = (value = 0) => {
  const percent = Math.round(value * 100);

  if (percent > 80) return "HIGH";
  if (percent >= 50) return "MEDIUM";
  return "LOW";
};

  // ✅ SUBMIT RATE SHEET (CAPTURES EDITED VALUES)
  const handleSubmitRateSheet = () => {
  const pendingItems = rates.filter(
    r => r.review_decision === "PENDING"
  );

  // 🚨 Guard: unreviewed items exist
  if (pendingItems.length > 0) {
    const proceed = window.confirm(
      "There are line items that have not been reviewed.\n\nDo you want to approve all AI recommendations and proceed?"
    );

    if (!proceed) {
      return; // ❌ stop submission
    }

    // ✅ Auto-approve remaining items
    setRates(prev =>
      prev.map(r =>
        r.review_decision === "PENDING"
          ? { ...r, review_decision: "APPROVED" }
          : r
      )
    );
  }

  // ✅ Build submitted rate sheet
  const formatted = rates.map((row, idx) => ({
    cpt_code: row.service_code,
    description:
      row.review_decision === "DENIED"
        ? row.description       // ❌ denied → original
        : row.ai_description,  // ✅ approved → AI
    amount: row.ai_rate,
    currency: "USD",
    modifier: null,
    unit: 1,
    unit_type: idx % 2 === 0 ? "Visit" : "Procedure",
    status: "Active"
  }));

  setSubmittedRates(formatted);
  setShowRateSheet(true);
};


  /* ---------- RENDER ---------- */

  return (
    <div style={{ padding: "40px", maxWidth: "1600px", margin: "auto" }}>
      <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px"
  }}
>
  <h2 style={{ fontSize: "28px", fontWeight: 700 }}>
    AI Rate Review & Comparison
  </h2>

  <button
    onClick={() => setShowFileViewer(true)}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      padding: "8px 12px",
      background: "#f1f5f9",
      border: "1px solid #cbd5f5",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: 600,
      fontSize: "13px"
    }}
  >
    👁 View File
  </button>
</div>


      <div style={{ overflowX: "auto" }}>
        <table style={table}>
          <thead>
            <tr>
              <th>Select</th>
              <th>CPT</th>
              <th>Description</th>
              <th>AI Description</th>
              <th>Existing Rate</th>
              <th>AI Normalized Rate</th>
              <th>Confidence</th>
              {/* <th>Status</th> */}
              <th>AI Insights</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {rates.map((row, idx) => {
              const confidenceValue = row.confidence ?? 0;
              const confidencePercent = Math.round(confidenceValue * 100);

              return (
                <tr key={idx}>
                    <td>
  <input
    type="checkbox"
    checked={selectedRows.has(row.service_code)}
    onChange={() => toggleRowSelection(row.service_code)}
  />
</td>
                  <td>
                    <input
                      value={row.service_code}
                      onChange={(e) =>
                        handleEdit(idx, "service_code", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td>{row.description}</td>
                
                  <td>
                    <input
                      value={row.ai_description}
                      onChange={(e) =>
                        handleEdit(idx, "ai_description", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td>{row.existing_rate}</td>

                  <td>
                    <input
                      type="number"
                      value={row.ai_rate ?? ""}
                      onChange={(e) =>
                        handleEdit(idx, "ai_rate", Number(e.target.value))
                      }
                      style={inputStyle}
                    />
                  </td>
<td>
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      fontSize: "13px",
      fontWeight: 600,
      marginBottom: "4px"
    }}
  >
    {/* <span>{confidencePercent}%</span> */}
    <span>{confidenceLabel(confidenceValue)}</span>
  </div>

  {/* <div style={barContainer}>
    <div
      style={{
        ...barFill,
        width: `${confidencePercent}%`,
        background: confidenceColor(confidenceValue)
      }}
    />
  </div> */}
</td>


                  {/* <td>{statusBadge(row.status, row)}</td> */}
                  <td>{row.notes}</td>
                  <td>
  {row.review_decision === "APPROVED" && (
    <div style={approvedBadge}>✔</div>
  )}

  {row.review_decision === "DENIED" && (
    <div style={deniedBadge}>✖</div>
  )}

  {row.review_decision === "PENDING" && (
    <div style={{ display: "flex", gap: "10px" }}>
      <button
        style={approveBtn}
        onClick={() => handleApprove(row)}
      >
        ✔

      </button>
      <button
        style={denyBtn}
        onClick={() => handleDeny(row)}
      >
        ✖

      </button>
    </div>
  )}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>



      {/* ---------- SUBMIT BUTTON ---------- */}
     <div
  style={{
    marginTop: "30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  }}
>
  {/* LEFT: SUBMIT */}
  <button
    onClick={handleSubmitRateSheet}
    style={{
      padding: "12px 20px",
      background: "#0f766e",
      color: "#fff",
      border: "none",
      borderRadius: "10px",
      fontWeight: "bold",
      cursor: "pointer"
    }}
  >
    Submit Rate Sheet
  </button>

  {/* RIGHT: BULK ACTIONS */}
  <div style={{ display: "flex", gap: "12px" }}>
    <button
      onClick={handleBulkApprove}
      style={{
        padding: "10px 16px",
        background: "#478500",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Bulk Approve
    </button>

    <button
      onClick={handleBulkDeny}
      style={{
        padding: "10px 16px",
        background: "#AF2616",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        fontWeight: "bold",
        cursor: "pointer"
      }}
    >
      Bulk Deny
    </button>
  </div>
</div>


      {/* ---------- RATE SHEET TABLE ---------- */}
      {showRateSheet && (
        <div style={{ marginTop: "40px" }}>
          <h3 style={{ marginBottom: "16px" }}>Submitted Rate Sheet</h3>

          <table style={rateSheetTable}>
            <thead>
              <tr>
                {["CPT Code", "Description", "Amount", "Currency","Unit", "Unit Type", "Status"].map(h => (
                  <th key={h} style={rateTh}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {submittedRates.map((row, i) => (
                <tr key={i} style={{ background: i % 2 ? "#fff" : "#f8fafc" }}>
                  <td style={rateTd}>{row.cpt_code}</td>
                  <td style={rateTd}>{row.description}</td>
                  <td style={rateTd}>{row.amount}</td>
                  <td style={rateTd}>{row.currency}</td>
                  {/* <td style={rateTd}>—</td> */}
                  <td style={rateTd}>{row.unit}</td>
                  <td style={rateTd}>{row.unit_type}</td>
                  <td style={{ ...rateTd, color: "#16a34a", fontWeight: 700 }}>
                    {row.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- ISSUE MODAL ---------- */}
{selectedIssue && (
  <div style={modalOverlay}>
    <div style={modal}>
      <h3 style={{ marginBottom: "16px" }}>
        Manual Review Required
      </h3>

      {selectedIssue.issues.map((issue, idx) => {
        // STRING ISSUE (e.g. CPT_CODE_NOT_PRESENT)
        if (typeof issue === "string") {
          return (
            <div
              key={idx}
              style={{
                padding: "10px",
                background: "#fef3c7",
                borderRadius: "8px",
                marginBottom: "10px",
                fontSize: "14px"
              }}
            >
              ⚠ {issue.replace(/_/g, " ")}
            </div>
          );
        }

        // OBJECT ISSUE (e.g. DESCRIPTION_MISMATCH)
        if (issue.type === "DESCRIPTION_MISMATCH") {
          return (
            <div
              key={idx}
              style={{
                padding: "12px",
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: "10px",
                marginBottom: "12px"
              }}
            >
              <div style={{ fontWeight: 700, color: "#9a3412" }}>
                ⚠ Description Mismatch
              </div>

              <div style={{ fontSize: "13px", marginTop: "6px" }}>
                <strong>System:</strong> {issue.db_value}
              </div>

              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                <strong>File:</strong> {issue.file_value}
              </div>
            </div>
          );
        }

        // FALLBACK FOR FUTURE ISSUE TYPES
        return (
          <div key={idx} style={{ marginBottom: "10px" }}>
            ⚠ {issue.type}
          </div>
        );
      })}

      <button
        style={{ ...approveBtn, marginTop: "16px" }}
        onClick={handleModalClose}
      >
        Close
      </button>
    </div>
  </div>
)}

      {isModalVisible && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>{isDenied ? "Rate Reject" : "Success"}</h3>
            <p>
              {isDenied
                ? "RATE REJECT - NO CHANGES TO DB"
                : "Your changes have been successfully updated."}
            </p>
            <button style={approveBtn} onClick={handleModalClose}>Close</button>
          </div>
        </div>
      )}
      {/* ---------- FILE VIEWER MODAL ---------- */}
{showFileViewer && (
  <div style={modalOverlay}>
    <div
      style={{
        ...modal,
        width: "70%",
        maxWidth: "900px",
        height: "80vh",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px"
        }}
      >
        <h3 style={{ fontSize: "16px", fontWeight: 600 }}>
  {uploadedFileName}
</h3>

        <button
          onClick={() => setShowFileViewer(false)}
          style={denyBtn}
        >
          Close
        </button>
      </div>

      <div
        style={{
          flex: 1,
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          background: "#fff"
        }}
      >
        {uploadedFileUrl ? (
  getFileType(uploadedFileUrl) === "pdf" ? (
    // ✅ PDF INLINE PREVIEW
    <iframe
      title="Uploaded File"
      src={uploadedFileUrl}
      style={{ width: "100%", height: "100%", border: "none" }}
    />
  ) : (
    // 📊 EXCEL / OTHER FILES
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        color: "#334155"
      }}
    >
      <div style={{ fontSize: "16px", fontWeight: 600 }}>
        Preview not available for this file type
      </div>

      <div style={{ fontSize: "13px", color: "#64748b" }}>
        Excel files cannot be previewed in browser
      </div>

      <a
        href={uploadedFileUrl}
        download
        style={{
          padding: "10px 16px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: "8px",
          textDecoration: "none",
          fontWeight: 600
        }}
      >
        ⬇ Download File
      </a>
    </div>
  )
) : (
  <div style={{ padding: "20px", textAlign: "center", color: "#6b7280" }}>
    No file available to preview.
  </div>
)}


      </div>
    </div>
  </div>
)}

    </div>
    
  );
  
}



/* ---------- STYLES ---------- */

const table = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
};

const rateSheetTable = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  boxShadow: "0 6px 20px rgba(0,0,0,0.12)",
  borderRadius: "12px",
  overflow: "hidden"
};

const rateTh = {
  padding: "14px",
  background: "#f1f5f9",
  textAlign: "left",
  fontWeight: 700
};

const rateTd = {
  padding: "14px",
  borderTop: "1px solid #e5e7eb"
};

const barContainer = {
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "6px"
};

const barFill = { height: "100%" };

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
  width: "70%"
};

const approveBtn = {
  padding: "8px 14px",
  // background: "#478500",
  color: "#478500",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold"
};

const denyBtn = {
  padding: "8px 14px",
  // background: "#AF2616",
  color: "#AF2616",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold"
};

const iconBtn = {
//   background: "#f97316",
  border: "none",
  borderRadius: "6px",
  color: "#0a0a0aff",
  padding: "4px 8px",
  cursor: "pointer"
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modal = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  width: "450px"
};

const approvedBadge = {
  padding: "6px 12px",
  background: "#dcfce7",
  color: "#478500",
  borderRadius: "12px",
  fontSize: "10px",
  fontWeight: "bold",
  textAlign: "center"
};

const deniedBadge = {
  padding: "6px 12px",
  background: "#fee2e2",
  color: "#AF2616",
  borderRadius: "12px",
  fontSize: "10px",
  fontWeight: "bold",
  textAlign: "center"
};

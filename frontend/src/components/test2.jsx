import React, { useState } from "react";
import { useLocation } from "react-router-dom";

export default function AIReview() {
  const location = useLocation();
  const ratesFromState = location.state?.rates || [];

  const [rates, setRates] = useState(ratesFromState);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isDenied, setIsDenied] = useState(false);

  /* ---------- HELPERS ---------- */
  
  const confidenceColor = (value = 0) => {
    if (value >= 0.85) return "#22c55e";  // Green
    if (value >= 0.6) return "#f59e0b";   // Amber
    return "#ef4444";  // Red
  };

  const statusBadge = (status, row) => { // Accept row as argument
    const map = {
      CLEAN: { bg: "#dcfce7", color: "#166534" },
      NEW: { bg: "#e0f2fe", color: "#075985" },
      MANUAL_INTERVENTION: { bg: "#ffedd5", color: "#9a3412" },
      AMBIGUOUS: { bg: "#fef3c7", color: "#92400e" }
    };

    const style = map[status] || map.AMBIGUOUS;

    return (
      <span
        style={{
          padding: "8px 14px",
          borderRadius: "16px",
          fontSize: "14px",
          fontWeight: "bold",
          background: style.bg,
          color: style.color,
          textTransform: "capitalize"
        }}
      >
        {status === 'MANUAL_INTERVENTION' ? (
          <div>
            <span style={{ marginBottom: "10px", display: "block" }}>
              REVIEW PENDING
            </span>
            {/* Eye button below "REVIEW PENDING" */}
            <button
              style={iconBtn}
              onClick={() => setSelectedIssue(row)}
            >
              👁
            </button>
          </div>
        ) : (
          status.replace("_", " ")
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
    setIsModalVisible(true);
    setIsDenied(false);
    setTimeout(() => {
      alert(`Accepted rate for CPT ${row.service_code}`);
    }, 400);
  };

  const handleDeny = () => {
    setIsModalVisible(true);
    setIsDenied(true);
    setTimeout(() => {
      alert('RATE REJECT - NO CHANGES TO DB');
    }, 400);
  };

  const handleModalClose = () => {
    setSelectedIssue(null);  // Clear the selected issue when closing the modal
    setIsModalVisible(false);  // Close the modal
  };

  /* ---------- RENDER ---------- */

  return (
    <div style={{ padding: "40px", maxWidth: "1600px", margin: "auto" }}>
      <h2 style={{ marginBottom: "30px", fontSize: "28px", fontWeight: 700 }}>
        AI Rate Review & Comparison
      </h2>

      <div style={{ overflowX: "auto", marginBottom: "40px" }}>
        <table style={table}>
          <thead>
            <tr>
              <th>CPT</th>
              <th>Description</th>
              <th>Existing Rate</th>
              <th>AI Normalized Rate</th>
              <th>Confidence</th>
              <th>Status</th>
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
                      value={row.service_code}
                      onChange={(e) =>
                        handleEdit(idx, "service_code", e.target.value)
                      }
                      style={inputStyle}
                    />
                  </td>

                  <td>
                    <input
                      value={row.description}
                      onChange={(e) =>
                        handleEdit(idx, "description", e.target.value)
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
                    <div style={{ fontSize: "14px", marginBottom: "6px" }}>
                      {confidencePercent}%
                    </div>
                    <div style={barContainer}>
                      <div
                        style={{
                          ...barFill,
                          width: `${confidencePercent}%`,
                          background: confidenceColor(confidenceValue),
                        }}
                      />
                    </div>
                  </td>

                  <td>{statusBadge(row.status, row)}</td> {/* Pass row to statusBadge */}

                  <td>
                    <div>
                      <button
                        style={approveBtn}
                        onClick={() => handleApprove(row)}
                      >
                        Approve
                      </button>
                      <button
                        style={denyBtn}
                        onClick={handleDeny}
                      >
                        Deny
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------- ISSUE MODAL ---------- */}
      {selectedIssue && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>Manual Review Required</h3>

            {selectedIssue.issues.map((issue, i) => {
              // STRING ISSUE
              if (typeof issue === "string") {
                return (
                  <div key={i}>
                    <strong>{issue}</strong>
                  </div>
                );
              }

              // OBJECT ISSUE
              return (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <strong>{issue.type}</strong>
                  <div>DB: {issue.db_value}</div>
                  <div>File: {issue.file_value}</div>
                </div>
              );
            })}

            <button
              style={{ ...approveBtn, marginTop: "16px" }}  // Change from acceptBtn to approveBtn
              onClick={handleModalClose}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------- CONFIRMATION MODAL ---------- */}
      {isModalVisible && (
        <div style={modalOverlay}>
          <div style={modal}>
            <h3>{isDenied ? 'Rate Reject' : 'Success'}</h3>
            <p>{isDenied ? 'RATE REJECT - NO CHANGES TO DB' : 'Your changes have been successfully updated to the database.'}</p>
            <button
              style={isDenied ? denyBtn : approveBtn}  // Use denyBtn if rejected, approveBtn if approved
              onClick={handleModalClose}
            >
              Close
            </button>
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
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)"
};

const barContainer = {
  width: "100%",
  height: "8px",
  background: "#e5e7eb",
  borderRadius: "6px",
  overflow: "hidden"
};

const barFill = {
  height: "100%",
  transition: "width 0.4s ease"
};

const inputStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
  fontSize: "14px",
  width: "90%",
  backgroundColor: "#f8fafc",
  boxSizing: "border-box",
};

const approveBtn = {
  padding: "8px 10px",
  background: "#22c55e",  // Green
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const denyBtn = {
  padding: "8px 10px",
  background: "#ef4444",  // Red
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
};

const iconBtn = {
  padding: "4px 10px",
//   background: "#f97316",  // Orange
  color: "#0c0c0cff",
  border: "none",
//   borderRadius: "8px",
  cursor: "pointer",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};

const modal = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  width: "450px",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)"
};

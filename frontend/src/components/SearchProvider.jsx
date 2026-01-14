import React, { useState } from "react";
import { searchProviders, getContracts } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function SearchProvider() {
  /* -------------------- STATE -------------------- */

  const [searchForm, setSearchForm] = useState({
    provider_name: "",
    npi: "",
    tax_id: "",
    provider_type: "",
    specialty: "",
    location: ""
  });

  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const [lob, setLob] = useState("Medicaid");
  const [contracts, setContracts] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);

  const [feeSchedule, setFeeSchedule] = useState({
    schedule_name: "",
    schedule_type: "Physician Fee Schedule",
    service_qualifier: "CPT",
    effective_date: "",
    end_date: "",
    document_link: "",
    file: null
  });

  const navigate = useNavigate();

  /* -------------------- HANDLERS -------------------- */

  const handleSearchChange = (e) =>
    setSearchForm({ ...searchForm, [e.target.name]: e.target.value });

  const handleSearchProviders = async () => {
    const data = await searchProviders(searchForm);
    setProviders(data);
    setSelectedProvider(null);
    setContracts([]);
    setSelectedContract(null);
  };

  const handleSelectProvider = async (provider) => {
    setSelectedProvider(provider);
    setSelectedContract(null);
    const contractData = await getContracts(provider.provider_id, lob);
    setContracts(contractData);
  };

  const handleFeeScheduleChange = (e) =>
    setFeeSchedule({ ...feeSchedule, [e.target.name]: e.target.value });

  const handleFileUpload = (e) => {
  const file = e.target.files[0];

  setFeeSchedule({
    ...feeSchedule,
    file,
    filePreviewUrl: URL.createObjectURL(file) // ✅ NEW
  });
};


  const handleProcessRateSheet = async () => {
    if (!feeSchedule.document_link && !feeSchedule.file) {
      alert("Please provide a rate sheet link or upload a file.");
      return;
    }

    const formData = new FormData();
    formData.append("contract_id", selectedContract.contract_id);

    if (feeSchedule.document_link) {
      formData.append("document_link", feeSchedule.document_link);
    }
    if (feeSchedule.file) {
      formData.append("file", feeSchedule.file);
    }

    const response = await fetch("http://localhost:8002/ai/parse-rate-sheet", {
      method: "POST",
      body: formData
    });

    const data = await response.json();
    navigate("/ai-review", {
  state: {
    rates: data.comparison,
    uploadedFileUrl: feeSchedule.filePreviewUrl || null,
    uploadedFileName: feeSchedule.file?.name || "Uploaded File"
  }
});

  };

  /* -------------------- STYLES -------------------- */

  const page = {
    background: "#f8fafc",
    minHeight: "100vh",
    padding: "40px"
  };

  const card = {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "28px",
    marginBottom: "32px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)"
  };

  const heading = {
    fontSize: "18px",
    fontWeight: 600,
    marginBottom: "18px",
    color: "#0f172a"
  };

  const input = {
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5f5",
    fontSize: "14px",
    width: "100%"
  };

  const select = { ...input, background: "#fff" };

  const primaryBtn = {
    background: "#4f46e5",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: "10px",
    border: "none",
    fontWeight: 600,
    cursor: "pointer"
  };

  const secondaryBtn = {
    background: "#eef2ff",
    color: "#4338ca",
    padding: "8px 14px",
    borderRadius: "8px",
    border: "none",
    fontWeight: 500,
    cursor: "pointer"
  };

  /* -------------------- UI -------------------- */

  return (
    <div style={page}>
      <h1 style={{ fontSize: "26px", fontWeight: 700, marginBottom: "28px" }}>
        Provider Fee Schedule Intake
      </h1>

      {/* Provider Search */}
      <div style={card}>
        <div style={heading}>Search Provider</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "40px",
            alignItems: "stretch"
          }}
        >
          <input
            style={input}
            name="provider_name"
            placeholder="Provider Name"
            onChange={handleSearchChange}
          />
          <input
            style={input}
            name="npi"
            placeholder="NPI"
            onChange={handleSearchChange}
          />
          <input
            style={input}
            name="tax_id"
            placeholder="Tax ID"
            onChange={handleSearchChange}
          />
          <input
            style={input}
            name="provider_type"
            placeholder="Provider Type"
            onChange={handleSearchChange}
          />
          <input
            style={input}
            name="specialty"
            placeholder="Specialty"
            onChange={handleSearchChange}
          />
          <input
            style={input}
            name="location"
            placeholder="Location"
            onChange={handleSearchChange}
          />
        </div>

        <div style={{ marginTop: "20px" }}>
          <button style={primaryBtn} onClick={handleSearchProviders}>
            Search Providers
          </button>
        </div>
      </div>

      {/* Provider Results */}
      {providers.length > 0 && (
        <div style={card}>
          <div style={heading}>Provider Results</div>

          <table width="100%" cellPadding="12">
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <th>Name</th>
                <th>NPI</th>
                <th>Tax ID</th>
                <th>Specialty</th>
                <th>Location</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {providers.map((p) => (
                <tr key={p.provider_id}>
                  <td>{p.provider_name}</td>
                  <td>{p.npi}</td>
                  <td>{p.tax_id}</td>
                  <td>{p.specialty}</td>
                  <td>{p.location}</td>
                  <td>
                    <button
                      style={secondaryBtn}
                      onClick={() => handleSelectProvider(p)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contract Selection */}
      {selectedProvider && (
        <div style={card}>
          <div style={heading}>
            Contracts for {selectedProvider.provider_name}
          </div>

          {/* Display selected provider details */}
          <div>
            <strong>Provider Name: </strong> {selectedProvider.provider_name}
            <br />
            <strong>NPI: </strong> {selectedProvider.npi}
            <br />
            <strong>Location: </strong> {selectedProvider.location}
            <br />
            <strong>TAX ID: </strong> {selectedProvider.tax_id}
            
          </div>
<br />
          <label>Line of Business</label>
          <select style={select} value={lob} onChange={(e) => setLob(e.target.value)}>
            <option>Medicaid</option>
            <option>Commercial</option>
            <option>Medicare</option>
            <option>Individual</option>
          </select>

          <table width="100%" cellPadding="12" style={{ marginTop: "16px" }}>
            <thead style={{ background: "#f1f5f9" }}>
              <tr>
                <th>Type</th>
                <th>LOB</th>
                <th>Effective Date</th>
                <th>End Date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {contracts.length === 0 ? (
                <tr>
                  <td colSpan="5" align="center">
                    No contracts found
                  </td>
                </tr>
              ) : (
                contracts.map((c) => (
                  <tr key={c.contract_id}>
                    <td>{c.contract_type}</td>
                    <td>{c.lob}</td>
                    <td>{c.effective_date}</td>
                    <td>{c.end_date}</td>
                    <td>
                      <button style={secondaryBtn} onClick={() => setSelectedContract(c)}>
                        Select Contract
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fee Schedule Upload */}
      {selectedContract && (
        <div style={{ ...card, border: "2px solid #4f46e5" }}>
          <div style={heading}>Fee Schedule Details</div>

          {/* Display selected provider details */}
          <div>
            <strong>Provider Name: </strong> {selectedProvider.provider_name}
            <br />
            <strong>NPI: </strong> {selectedProvider.npi}
            <br />
            <strong>Location: </strong> {selectedProvider.location}
            <br />
            <strong>TAX ID: </strong> {selectedProvider.tax_id}
          </div>
<br />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "40px" }}>
            <input style={input} name="schedule_name" placeholder="Fee Schedule Name" onChange={handleFeeScheduleChange} />
            <select style={select} name="schedule_type" onChange={handleFeeScheduleChange}>
              <option>Physician Fee Schedule</option>
              <option>RBRVS</option>
              <option>DRG</option>
              <option>APG</option>
            </select>
            <select style={select} name="service_qualifier" onChange={handleFeeScheduleChange}>
              <option>CPT</option>
              <option>HCPCS</option>
            </select>
            <input style={input} type="date" name="effective_date" onChange={handleFeeScheduleChange} />
            <input style={input} type="date" name="end_date" onChange={handleFeeScheduleChange} />
            <input style={input} name="document_link" placeholder="SharePoint / Teams / PDF / Excel link" onChange={handleFeeScheduleChange} />
            <input style={input} type="file" accept=".xls,.xlsx,.pdf" onChange={handleFileUpload} />
          </div>

          <div style={{ marginTop: "24px" }}>
            <button style={primaryBtn} onClick={handleProcessRateSheet}>
              Process Rate Sheet with AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

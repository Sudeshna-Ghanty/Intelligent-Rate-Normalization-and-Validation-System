// src/components/ContractSelection.jsx
import React, { useEffect, useState } from 'react';
import { getContracts } from '../services/api'; // Importing the getContracts function
import { useNavigate, useLocation } from 'react-router-dom'; // For navigation and query params

export default function ContractSelection() {
  const [contracts, setContracts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const providerId = new URLSearchParams(location.search).get('providerId'); // Get providerId from URL query

  const [lob, setLob] = useState("Medicaid"); // Default LOB filter, can be changed dynamically

  useEffect(() => {
    // Fetch contracts based on the providerId and LOB
    const fetchContracts = async () => {
      const data = await getContracts(providerId, lob);
      setContracts(data); // Set contracts in the state
    };

    fetchContracts(); // Call the function to fetch contracts
  }, [providerId, lob]); // Re-run the effect if providerId or LOB changes

  const handleSelectContract = (contractId) => {
    navigate(`/fee-schedule?contractId=${contractId}`); // Navigate to fee schedule page
  };

  return (
    <div style={{ padding: "24px" }}>
      <h2>Select Provider Contract</h2>
      <div style={{ marginBottom: "16px" }}>
        <label>Select Line of Business: </label>
        <select onChange={(e) => setLob(e.target.value)} value={lob}>
          <option value="Medicaid">Medicaid</option>
          <option value="Commercial">Commercial</option>
          <option value="Medicare">Medicare</option>
          <option value="Individual">Individual</option>
        </select>
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Contract Type</th>
            <th>LOB</th>
            <th>Effective Date</th>
            <th>End Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {contracts.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>No contracts found for this provider</td>
            </tr>
          ) : (
            contracts.map((contract) => (
              <tr key={contract.contract_id}>
                <td>{contract.contract_type}</td>
                <td>{contract.lob}</td>
                <td>{contract.effective_date}</td>
                <td>{contract.end_date}</td>
                <td>
                  <button onClick={() => handleSelectContract(contract.contract_id)}>Select</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// src/components/FeeScheduleForm.jsx
import React, { useState } from 'react';
import { createFeeSchedule, processRateSchedule } from '../services/api';
import { useNavigate } from 'react-router-dom';

export default function FeeScheduleForm() {
  const [scheduleName, setScheduleName] = useState('');
  const [scheduleType, setScheduleType] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [endDate, setEndDate] = useState('');
//   const [documentId, setDocumentId] = useState(1);
  const [documentId] = useState(1);
 // Example document ID
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const payload = {
      fee_schedule_id: Math.floor(Math.random() * 1000), // Simulating ID generation
      contract_id: 1, // Example contract ID
      schedule_name: scheduleName,
      schedule_type: scheduleType,
      effective_date: effectiveDate,
      end_date: endDate,
      document_id: documentId,
    };

    await createFeeSchedule(payload);
    const aiResponse = await processRateSchedule(payload);

    if (aiResponse.status === 'SUCCESS') {
      navigate('/confirmation');
    }
  };

  return (
    <div>
      <h2>Create Fee Schedule</h2>
      <input
        type="text"
        value={scheduleName}
        onChange={(e) => setScheduleName(e.target.value)}
        placeholder="Schedule Name"
      />
      <input
        type="text"
        value={scheduleType}
        onChange={(e) => setScheduleType(e.target.value)}
        placeholder="Schedule Type"
      />
      <input
        type="date"
        value={effectiveDate}
        onChange={(e) => setEffectiveDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit Fee Schedule</button>
    </div>
  );
}

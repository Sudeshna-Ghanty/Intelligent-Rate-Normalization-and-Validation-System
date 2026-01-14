// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SearchProvider from './components/SearchProvider';
import ContractSelection from './components/ContractSelection';
import FeeScheduleForm from './components/FeeScheduleForm';
import Confirmation from './components/Confirmation';
import AIReview from "./components/AIReview";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SearchProvider />} />
        <Route path="/contract-selection" element={<ContractSelection />} />
        <Route path="/fee-schedule" element={<FeeScheduleForm />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/ai-review" element={<AIReview />} />
      </Routes>
    </Router>
  );
}

// Ensure the correct default export
export default App;

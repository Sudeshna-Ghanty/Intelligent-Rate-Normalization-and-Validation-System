// src/services/api.js
import axios from 'axios';

const API_URL = 'http://localhost:8000'; // Update if the backend URL is different

// Fetch providers based on the search query
export const searchProviders = async (params) => {
  const response = await fetch(
    `http://localhost:8000/providers/search?${new URLSearchParams(params)}`
  );
  return response.json();
};

// Fetch contracts for a selected provider
// src/services/api.js
export const getContracts = async (providerId, lob) => {
  try {
    const response = await fetch(
      `http://localhost:8000/contracts/by-provider/${providerId}?lob=${lob}`
    );
    return response.json(); // Return the JSON data
  } catch (error) {
    console.error("Error fetching contracts:", error);
    throw error;
  }
};
// Fetch all providers
export const getAllProviders = async () => {
  const res = await fetch("http://localhost:8000/providers/all");
  return res.json();
};


// Create a new fee schedule
export const createFeeSchedule = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/fee-schedules/create`, payload);
    return response.data;
  } catch (error) {
    console.error('Error creating fee schedule:', error);
    throw error;
  }
};

// Process fee schedule using AI
export const processRateSchedule = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/rate-intake/process`, payload);
    return response.data;
  } catch (error) {
    console.error('Error processing rate schedule:', error);
    throw error;
  }
};

export const processRateSheet = async (payload) => {
  const response = await fetch(
    "http://localhost:8000/rate-intake/process",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  return response.json();
};


// Finalize service rates
export const finalizeServiceRates = async (payload) => {
  try {
    const response = await axios.post(`${API_URL}/finalize/finalize`, payload);
    return response.data;
  } catch (error) {
    console.error('Error finalizing service rates:', error);
    throw error;
  }
};

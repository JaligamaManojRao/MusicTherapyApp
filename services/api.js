import axios from "axios";

// IMPORTANT: Replace with your Mac's IP address
// Find using: ifconfig | grep "inet " | grep -v 127.0.0.1
// Example: 192.168.1.5
const API_BASE_URL = "http://192.168.29.231:8080/api"; // Updated to current Mac's IP

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPatient = async (patientId) => {
  try {
    const response = await api.get(`/patients/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient:", error);
    throw error;
  }
};

export const getAllPatients = async () => {
  try {
    const response = await api.get("/patients");
    return response.data;
  } catch (error) {
    console.error("Error fetching patients:", error);
    throw error;
  }
};

export const registerPatient = async (patientData) => {
  try {
    const response = await api.post("/patients/register", patientData);
    return response.data;
  } catch (error) {
    console.error("Error registering patient:", error);
    throw error;
  }
};

export const savePhysiologicalData = async (data) => {
  try {
    const response = await api.post("/patients/physiological-data", data);
    return response.data;
  } catch (error) {
    console.error("Error saving physiological data:", error);
    throw error;
  }
};

export const startTherapySession = async (patientId) => {
  try {
    const response = await api.post(`/therapy/start?patient_id=${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error starting therapy session:", error);
    throw error;
  }
};

export const searchMusic = async (query, limit = 10) => {
  try {
    const response = await api.get(
      `/music/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error searching music:", error);
    throw error;
  }
};

export const getPatientSessions = async (patientId) => {
  try {
    const response = await api.get(`/therapy/sessions/patient/${patientId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching patient sessions:", error);
    throw error;
  }
};

export const endTherapySession = async (sessionId, duration, footMassage) => {
  try {
    const response = await api.post("/therapy/end", {
      session_id: sessionId,
      duration_minutes: duration,
      foot_massage_completed: footMassage,
    });
    return response.data;
  } catch (error) {
    console.error("Error ending session:", error);
    throw error;
  }
};

export const loginPatient = async (email) => {
  try {
    const response = await api.post("/patients/login", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePatient = async (patientId, updateData) => {
  try {
    const response = await api.put(`/patients/${patientId}`, updateData);
    return response.data;
  } catch (error) {
    console.error("Error updating patient:", error);
    throw error;
  }
};

export const getSpecialists = async () => {
  try {
    const response = await api.get("/patients/specialists");
    return response.data;
  } catch (error) {
    console.error("Error fetching specialists:", error);
    throw error;
  }
};

export default api;

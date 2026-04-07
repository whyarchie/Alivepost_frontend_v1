const API_BASE = "https://api.alivepost.com/api/v1";

// ─── Generic Fetch Wrapper ─────────────────────────────────────
async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
    ...options,
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message || json.error || `Request failed (${res.status})`);
  }

  return json;
}

// ─── Hospital ──────────────────────────────────────────────────
export async function hospitalLogin(userId: string, password: string) {
  return apiFetch("/hospital/login", {
    method: "POST",
    body: JSON.stringify({ userId, password }),
  });
}

export async function searchHospital(name: string) {
  return apiFetch(`/hospital/search?name=${encodeURIComponent(name)}`);
}

export async function getHospitalById(id: number) {
  return apiFetch(`/hospital/id?key=${id}`);
}

export async function getPatientMedicineForHospital(patientId: number) {
  return apiFetch(`/hospital/patientmedicine?patientId=${patientId}`);
}

// ─── Patient ───────────────────────────────────────────────────
export interface CreatePatientData {
  name: string;
  dateOfBirth: string;
  bloodGroup: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  mobileNumber: string;
}

export async function createPatient(data: CreatePatientData) {
  return apiFetch("/patient/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function patientLogin(mobileNumber: string, name: string) {
  return apiFetch("/patient/login", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, name }),
  });
}

export async function patientLoginMedicine(mobileNumber: string, name: string) {
  return apiFetch("/patient/loginmedicine", {
    method: "POST",
    body: JSON.stringify({ mobileNumber, name }),
  });
}

export async function searchPatientByMobile(mobile: string) {
  return apiFetch(`/patient/search?mobile=${encodeURIComponent(mobile)}`);
}

// ─── Medical History ───────────────────────────────────────────
export interface CreateMedicalHistoryData {
  diseaseId: number;
  patientId: number;
  description?: string;
  startDate: string;
  endDate?: string;
}

export async function createMedicalHistory(data: CreateMedicalHistoryData) {
  return apiFetch("/patient/medicalhistorycreate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Patient Condition ─────────────────────────────────────────
export interface CreateConditionData {
  patientId: number;
  diseaseId: number;
  hospitalId: number;
  doctorId?: number;
  status: "STABLE" | "CRITICAL" | "RECOVERED";
  startDate: string;
  endDate?: string;
}

export async function createPatientCondition(data: CreateConditionData) {
  return apiFetch("/patient/condition", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPatientCondition(id: number) {
  return apiFetch(`/patient/condition/?id=${id}`);
}

// ─── Medicine Assignment ───────────────────────────────────────
export interface AssignMedicineData {
  patientConditionId: number;
  medicines: {
    medicineId: number;
    quantity?: number;
    tillDate: string;
    timings: string[];
  }[];
}

export async function assignMedicine(data: AssignMedicineData) {
  return apiFetch("/patient/condition/medicine", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Progress ──────────────────────────────────────────────────
export async function createPatientProgress(data: {
  patientConditionId: number;
  frequency: number;
  totalOccurrences: number;
  questions: string;
  startDate: string;
}) {
  return apiFetch("/patient/condition/createprogress", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPatientProgress(conditionId: number) {
  return apiFetch(`/patient/condition/progress?id=${conditionId}`);
}

// ─── Disease ───────────────────────────────────────────────────
export async function searchDisease(value: string) {
  return apiFetch(`/disease/search?value=${encodeURIComponent(value)}`);
}

export async function createDisease(data: { name: string; type: "CHRONIC" | "ACUTE"; description?: string }) {
  return apiFetch("/disease/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getDiseaseById(id: number) {
  return apiFetch(`/disease/?id=${id}`);
}

// ─── Medicine ──────────────────────────────────────────────────
export async function searchMedicine(value: string) {
  return apiFetch(`/medicine/search?value=${encodeURIComponent(value)}`);
}

export async function createMedicine(data: {
  brandName: string;
  genericName: string;
  dosageForm: string;
  dosageStrength?: string;
  manufacturer: string;
}) {
  return apiFetch("/medicine/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMedicineById(id: number) {
  return apiFetch(`/medicine/id?id=${id}`);
}

// ─── Doctor ────────────────────────────────────────────────────
export async function createDoctor(data: { name: string; username: string }) {
  return apiFetch("/doctor/create", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getAllDoctors(hospitalId: number) {
  return apiFetch(`/doctor/all?id=${hospitalId}`);
}

export async function searchDoctors(name: string) {
  return apiFetch(`/doctor/search?name=${encodeURIComponent(name)}`);
}

export async function getDoctorById(id: number) {
  return apiFetch(`/doctor/?id=${id}`);
}

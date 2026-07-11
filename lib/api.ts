const API_BASE = "/api/v1";
console.log("API_BASE:", API_BASE);


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

// The authenticated hospital's own profile. `balance` is the wallet balance in
// paise; `perDayPatientCost` is in rupees per enrolled patient per day.
export interface HospitalMe {
  id: number;
  name: string;
  helplineNumber: string;
  contactNumber: string;
  email: string;
  address: string;
  userId: string;
  perDayPatientCost: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

// Backend route: GET /hospital/me — requires a hospital token.
export async function getHospitalMe(): Promise<{ success: boolean; data: HospitalMe }> {
  return apiFetch("/hospital/me");
}

// Remove a patient from the authenticated hospital's care.
// Backend decides the scope: if the patient is also enrolled with other
// hospitals only this hospital's conditions are removed
// (data.deleted === "conditions"); otherwise the whole patient is deleted
// (data.deleted === "patient").
export interface HospitalDeletePatientResponse {
  success: boolean;
  data:
    | { deleted: "patient"; patient: { id: number; name: string } }
    | { deleted: "conditions"; patientId: number; conditionsDeleted: number };
}

export async function hospitalDeletePatient(
  patientId: number
): Promise<HospitalDeletePatientResponse> {
  return apiFetch(`/hospital/patient`, {
    method: "DELETE",
    body: JSON.stringify({ patientId }),
  });
}

// ─── Hospital Wallet / Razorpay Payments ───────────────────────
// The Razorpay order returned by the backend. Monetary fields are in the
// smallest currency unit (paise for INR), matching the Razorpay API.
export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

// Prefill details for the Razorpay checkout, sourced from the hospital record
// in the database so the payer never has to type their contact/email.
export interface RazorpayPrefill {
  name: string;
  email: string;
  contact: string;
}

// GST breakdown for a wallet top-up. All amounts are in paise, matching
// RazorpayOrder. `baseAmount` is what actually lands in the hospital's wallet
// balance once payment is verified — `gstAmount` is tax, not spendable credit.
export interface RazorpayGstBreakdown {
  baseAmount: number;
  gstAmount: number;
  gstRate: number;
  totalAmount: number;
}

export interface CreateHospitalOrderResponse {
  success: boolean;
  data: {
    order: RazorpayOrder;
    gst: RazorpayGstBreakdown;
    prefill: RazorpayPrefill;
  };
}

// Creates a Razorpay order to top up the authenticated hospital's balance.
// `amount` is in rupees; the backend converts it to paise before creating the
// order (POST /hospital/order).
export async function createHospitalOrder(
  amount: number
): Promise<CreateHospitalOrderResponse> {
  return apiFetch("/hospital/order", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

// Fields Razorpay Checkout hands back on a successful payment. Sent to the
// backend so it can verify the signature and credit the balance.
export interface VerifyHospitalPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyHospitalPaymentResponse {
  success: boolean;
  data: {
    // true when this payment was already settled (verify is idempotent).
    alreadyProcessed: boolean;
    orderId: string;
    paymentId: string;
    // The hospital's new balance in paise; present only on the first settlement.
    balance?: number;
  };
}

// Verifies a completed Razorpay checkout and credits the hospital balance
// (POST /hospital/verify). Idempotent on the backend.
export async function verifyHospitalPayment(
  data: VerifyHospitalPaymentData
): Promise<VerifyHospitalPaymentResponse> {
  return apiFetch("/hospital/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ─── Patient ───────────────────────────────────────────────────
export interface CreatePatientData {
  name: string;
  dateOfBirth: string;
  bloodGroup: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  mobileNumber: string;
  idType?: string;
  idNumber?: string;
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

export interface PatientsListResponse {
  success: boolean;
  data: {
    patients: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function getPatientList(page = 1, limit = 10): Promise<PatientsListResponse> {
  return apiFetch(`/patient/list?page=${page}&limit=${limit}`);
}

export type PatientStatus = "CRITICAL" | "WATCH" | "STABLE" | "RECOVERED" | "UNKNOWN";
export type PatientTrend = "DECLINING" | "FLAT" | "IMPROVING" | "INSUFFICIENT_DATA";

export interface RecoveryPoint {
  date: string;
  recovery: number | null;
  condition?: string;
}

export interface RecommendedAction {
  priority: "URGENT" | "IMPORTANT" | "ROUTINE";
  action: string;
}

export interface PatientSummary {
  status: PatientStatus;
  statusReason: string;
  trend: PatientTrend;
  criticalInfo: string[];
  recommendedActions: RecommendedAction[];
  summaryMarkdown: string;
  recoveryTrajectory: RecoveryPoint[];
}

export async function getPatientSummary(userId: number): Promise<{ success: boolean; data: PatientSummary }> {
  return apiFetch(`/patient/summary?userId=${userId}`);
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

// What the enrollment cost: days × perDayPatientCost (rupees/day) with half of
// that total deducted from the hospital wallet up front. `totalCost`, `charged`
// and `balance` are in paise.
export interface ConditionBilling {
  days: number;
  perDayPatientCost: number;
  totalCost: number;
  charged: number;
  balance: number;
}

// Creating a condition enrolls the patient and charges the hospital wallet.
// Fails with 402 (surfaced as an Error) when the balance is insufficient.
export async function createPatientCondition(
  data: CreateConditionData
): Promise<{ success: boolean; data: { id: number; billing?: ConditionBilling } & Record<string, any> }> {
  return apiFetch("/patient/condition", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getPatientCondition(id: number) {
  return apiFetch(`/patient/condition/?id=${id}`);
}

// ─── Condition Invoice / Recommendation Notes ──────────────────
// Fills the doctor's recommendation and/or the invoice instructions on one of
// the hospital's conditions. Only the fields provided are changed. These notes
// are printed on the patient's downloadable invoice.
export interface UpdateConditionRecommendationData {
  conditionId: number;
  doctorRecommendation?: string;
  invoiceRecommendation?: string;
}

export async function updateConditionRecommendation(
  data: UpdateConditionRecommendationData
): Promise<{
  success: boolean;
  data: { id: number; DoctorReccommendation: string | null; invoiceRecommendation: string | null };
}> {
  return apiFetch("/hospital/condition/recommendation", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
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
  questions: any[];
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
export async function getAllDiseases() {
  return apiFetch(`/disease/all`);
}

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
export async function getAllMedicines() {
  return apiFetch(`/medicine/all`);
}

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

export async function getAllDoctors() {
  return apiFetch(`/doctor/all`);
}

export async function searchDoctors(name: string) {
  return apiFetch(`/doctor/search?name=${encodeURIComponent(name)}`);
}

export async function getDoctorById(id: number) {
  return apiFetch(`/doctor/?id=${id}`);
}

// ─── Dashboard ──────────────────────────────────────────────────
export interface DashboardSummaryResponse {
  success: boolean;
  data: {
    totalPatients: number;
    activePatients: number;
    criticalAlerts: number;
    highRiskPatients: number;
  };
}

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  return apiFetch("/dashboard/summaryCard");
}

export interface HighRiskPatientsResponse {
  success: boolean;
  data: {
    patients: any[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export async function getHighRiskPatients(page = 1, limit = 10): Promise<HighRiskPatientsResponse> {
  return apiFetch(`/patient/high-risk?page=${page}&limit=${limit}`);
}

export interface DashboardChartsResponse {
  success: boolean;
  data: {
    activeConditions: {
      stable: number;
      critical: number;
      recovered: number;
    };
    medicationAdherence: {
      taken: number;
      missed: number;
      complianceRate: number;
    };
    topDiseases: {
      disease: string;
      count: number;
    }[];
    followUpStatuses: {
      status: string;
      count: number;
    }[];
    recoveryTrend: {
      date: string;
      averageRecovery: number;
    }[];
  };
}

export async function getDashboardCharts(): Promise<DashboardChartsResponse> {
  return apiFetch("/dashboard/charts");
}

// ─── AI Patient-Population Overview ─────────────────────────────
export type PopulationStatus =
  | "CRITICAL"
  | "NEEDS_ATTENTION"
  | "STABLE"
  | "HEALTHY"
  | "UNKNOWN";

export interface HospitalOverviewAction {
  priority: "URGENT" | "IMPORTANT" | "ROUTINE";
  action: string;
}

export interface HospitalOverview {
  status: PopulationStatus;
  headline: string;
  keyInsights: string[];
  concerns: string[];
  recommendedActions: HospitalOverviewAction[];
  summaryMarkdown: string;
  stats: {
    totalPatients: number;
    activePatients: number;
    criticalAlerts: number;
    highRiskPatients: number;
  };
}

// AI-generated operational summary of the hospital's whole patient population.
// Backend route: GET /dashboard/ai-overview — requires a hospital token. Slow
// (calls the LLM), so callers should cache the result.
export async function getHospitalAiOverview(): Promise<{ success: boolean; data: HospitalOverview }> {
  return apiFetch("/dashboard/ai-overview");
}




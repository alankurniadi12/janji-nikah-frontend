import api from "@/lib/api";

export async function createTransaction(packageId, promoCode = "") {
  const response = await api.post("/member/transactions", { packageId, promoCode });
  return response.data.data.transaction;
}

export async function redeemPromoCode(promoCode) {
  const response = await api.post("/member/transactions/promo-code", { promoCode });
  return response.data.data.transaction;
}

export async function getTransactions(params = {}) {
  const response = await api.get("/member/transactions", { params });
  return response.data.data;
}

export async function getTransaction(id) {
  const response = await api.get(`/member/transactions/${id}`);
  return response.data.data.transaction;
}

export async function refreshMayarTransaction(id) {
  const response = await api.post(`/member/transactions/${id}/refresh-mayar`);
  return response.data.data.transaction;
}

export async function uploadPaymentProof(id, file) {
  const formData = new FormData();
  formData.append("paymentProof", file);

  const response = await api.post(`/member/transactions/${id}/payment-proof`, formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });

  return response.data.data.transaction;
}

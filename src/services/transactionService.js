import api from "@/lib/api";

export async function createTransaction(packageId) {
  const response = await api.post("/member/transactions", { packageId });
  return response.data.data.transaction;
}

export async function redeemPromoCode(promoCode) {
  const response = await api.post("/member/transactions/promo-code", { promoCode });
  return response.data.data.transaction;
}

export async function getTransactions() {
  const response = await api.get("/member/transactions");
  return response.data.data.transactions;
}

export async function getTransaction(id) {
  const response = await api.get(`/member/transactions/${id}`);
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

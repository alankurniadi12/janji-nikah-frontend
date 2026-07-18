import api from "@/lib/api";

export async function getBrandingProfile() {
  const response = await api.get("/member/branding");
  return response.data.data.branding;
}

export async function upsertBrandingProfile(payload) {
  const response = await api.put("/member/branding", payload);
  return response.data.data.branding;
}

export async function generateBranding(payload) {
  const response = await api.post("/member/branding/generate", payload);
  return response.data.data;
}

import api from "@/lib/api";

export async function getCreditPackages() {
  const response = await api.get("/credit-packages");
  return response.data.data.packages;
}

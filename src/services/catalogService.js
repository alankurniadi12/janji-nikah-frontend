import api from "@/lib/api";

export async function getThemes() {
  const response = await api.get("/themes");
  return response.data.data.themes;
}

export async function getPublicDemoThemes() {
  const response = await api.get("/themes/public-demo");
  return response.data.data.themes;
}

export async function getMusic() {
  const response = await api.get("/music");
  return response.data.data.music;
}

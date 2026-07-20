export function assetUrl(url) {
  if (!url) {
    return "";
  }

  const uploadPath = getUploadPath(url);

  if (!uploadPath) {
    return url;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "/api";

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    return new URL(uploadPath, new URL(apiBaseUrl).origin).toString();
  }

  return uploadPath;
}

function getUploadPath(url) {
  if (url.startsWith("/uploads/")) {
    return url;
  }

  if (!/^https?:\/\//i.test(url)) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    return parsedUrl.pathname.startsWith("/uploads/") ? parsedUrl.pathname : "";
  } catch {
    return "";
  }
}

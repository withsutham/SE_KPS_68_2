export async function uploadMassageImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload/massage-image", {
    method: "POST",
    body: formData,
  });
  const result = await response.json();

  if (!response.ok || !result.success || !result.url) {
    throw new Error(result.error || "Failed to upload image");
  }

  return result.url as string;
}

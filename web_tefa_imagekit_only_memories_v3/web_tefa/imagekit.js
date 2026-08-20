// ImageKit browser upload helper.
// The Public Key is safe to expose in browser code.
// NEVER put the ImageKit Private Key here.

export const IMAGEKIT_ID = "fxoly3nbj";
export const IMAGEKIT_URL_ENDPOINT = "https://ik.imagekit.io/fxoly3nbj";
export const IMAGEKIT_PUBLIC_KEY = "public_kbngWQ0B7OhOMBTX87egsKzhOR0=";
export const IMAGEKIT_AUTH_ENDPOINT = "/api/imagekit-auth";

export async function uploadWeddingImage(blob, fileName, onProgress) {
  if (!(blob instanceof Blob)) {
    throw new Error("Invalid image.");
  }

  if (!IMAGEKIT_PUBLIC_KEY || IMAGEKIT_PUBLIC_KEY === "YOUR_IMAGEKIT_PUBLIC_KEY") {
    throw new Error("IMAGEKIT_PUBLIC_KEY_NOT_CONFIGURED");
  }

  const authResponse = await fetch(IMAGEKIT_AUTH_ENDPOINT, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store"
  });

  if (authResponse.status === 409) {
    throw new Error("MEMORY_LIMIT_REACHED");
  }

  if (!authResponse.ok) {
    throw new Error("IMAGEKIT_AUTH_FAILED");
  }

  const auth = await authResponse.json();

  if (!auth.token || !auth.signature || !auth.expire) {
    throw new Error("IMAGEKIT_AUTH_INVALID");
  }

  const formData = new FormData();
  formData.append("file", blob, fileName);
  formData.append("fileName", fileName);
  formData.append("publicKey", IMAGEKIT_PUBLIC_KEY);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);
  formData.append("useUniqueFileName", "true");
  formData.append("folder", "/wedding-memories");
  formData.append("tags", "wedding-memory");

  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", "https://upload.imagekit.io/api/v1/files/upload");
    xhr.responseType = "json";

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && typeof onProgress === "function") {
        onProgress(event.loaded / event.total);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300 && xhr.response?.url) {
        resolve(xhr.response);
        return;
      }
      console.error("ImageKit upload response:", xhr.status, xhr.response);
      reject(new Error("IMAGEKIT_UPLOAD_FAILED"));
    });

    xhr.addEventListener("error", () => reject(new Error("IMAGEKIT_NETWORK_ERROR")));
    xhr.addEventListener("abort", () => reject(new Error("IMAGEKIT_UPLOAD_ABORTED")));
    xhr.send(formData);
  });
}

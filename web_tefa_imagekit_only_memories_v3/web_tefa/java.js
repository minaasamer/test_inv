emailjs.init({
  publicKey: "YOUR_PUBLIC_KEY"
});

const targetDate = new Date("September 08, 2026 20:00:00").getTime();

function countdown() {
  const now = new Date().getTime();
  const diff = targetDate - now;

  document.getElementById("days").innerText =
    Math.floor(diff / (1000 * 60 * 60 * 24));

  document.getElementById("hours").innerText =
    Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  document.getElementById("minutes").innerText =
    Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  document.getElementById("seconds").innerText =
    Math.floor((diff % (1000 * 60)) / 1000);
}

setInterval(countdown, 1000);
countdown();

function sendWish() {

  const message = document.getElementById("guestMessage").value;
  const status = document.getElementById("status");

  if (!message.trim()) {
    status.innerText = "Please write a message first";
    return;
  }

  status.innerText = "Sending...";

  emailjs.send(
    "YOUR_SERVICE_ID",
    "YOUR_TEMPLATE_ID",
    {
      message: message
    }
  )
  .then(() => {
    status.innerText = "Message sent ❤️";
    document.getElementById("guestMessage").value = "";
  })
  .catch(() => {
    status.innerText = "Failed to send";
  });

}

// ================= MUSIC =================

const music = document.getElementById("bgMusic");
const musicBtn = document.getElementById("musicBtn");

let isPlaying = false;

function startMusic() {

  if (!music.paused) return;

  music.play().then(() => {

    isPlaying = true;
    musicBtn.classList.add("playing");
    musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

  }).catch(err => {
    console.log(err);
  });

}

// أول Click أو أول Touch في الصفحة
document.addEventListener("click", startMusic, { once: true });
document.addEventListener("touchstart", startMusic, { once: true });

// زر تشغيل / إيقاف
musicBtn.addEventListener("click", () => {

  if (music.paused) {

    music.play();

    isPlaying = true;
    musicBtn.classList.add("playing");
    musicBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';

  } else {

    music.pause();

    isPlaying = false;
    musicBtn.classList.remove("playing");
    musicBtn.innerHTML = '<i class="fa-solid fa-music"></i>';

  }

});

// ================= INTRO =================

window.addEventListener("load", () => {

  setTimeout(() => {
    document.getElementById("intro").classList.add("hide");
  }, 1500);

  setTimeout(() => {
    document.getElementById("intro").style.display = "none";
    document.body.style.overflow = "auto";
  }, 3000);

});

// ================= ABOUT SECTION ANIMATION =================

const aboutSection = document.querySelector(".about");

if (aboutSection) {

  const aboutObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          aboutSection.classList.add("about-visible");

          observer.unobserve(aboutSection);

        }

      });

    },
    {
      threshold: 0.25
    }
  );

  aboutObserver.observe(aboutSection);
}
// =====================================================
// COUNTDOWN — THE WEDDING PORTAL REVEAL
// =====================================================

const countdownSection = document.querySelector(".countdown-section");

if (countdownSection) {

  const countdownObserver = new IntersectionObserver(
    (entries, observer) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          countdownSection
            .querySelectorAll(
              ".glass-box, .section-title, .time-box"
            )
            .forEach((element) => {
              element.style.animationPlayState = "running";
            });

          observer.unobserve(countdownSection);
        }

      });

    },
    {
      threshold: 0.25
    }
  );

  countdownObserver.observe(countdownSection);
}
const scrollElements = document.querySelectorAll(
  '.countdown-heading, .date-card, .save-date, .countdown-box, .time-box'
);

const scrollObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');

        // Animation مرة واحدة فقط
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

scrollElements.forEach((element) => {
  scrollObserver.observe(element);
});
const sections = document.querySelectorAll('.about-section');

const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');

        // تشتغل مرة واحدة
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15
  }
);

sections.forEach((section) => {
  observer.observe(section);
});

// =====================================================
// CAMERA + WEDDING MEMORY EXPERIENCE
// =====================================================

(() => {

  const cameraFab = document.getElementById("cameraFab");
  const cameraModal = document.getElementById("cameraModal");
  const cameraVideo = document.getElementById("cameraVideo");
  const cameraCanvas = document.getElementById("cameraCanvas");
  const cameraPreview = document.getElementById("cameraPreview");
  const switchCamera = document.getElementById("switchCamera");
  const captureBtn = document.getElementById("captureBtn");
  const retakeBtn = document.getElementById("retakeBtn");
  const keepBtn = document.getElementById("keepBtn");
  const cameraClose = document.getElementById("cameraClose");
  const cameraControls = document.getElementById("cameraControls");
  const previewControls = document.getElementById("previewControls");
  const cameraMessage = document.getElementById("cameraMessage");
  const uploadProgress = document.getElementById("uploadProgress");
  const uploadProgressBar = document.getElementById("uploadProgressBar");
  const uploadProgressText = document.getElementById("uploadProgressText");

  if (!cameraFab || !cameraModal) return;

  let cameraStream = null;
  let capturedBlob = null;
  let messageTimer = null;
  let currentCamera = "environment";

  function showCameraMessage(message, duration = 3500) {
    cameraMessage.textContent = message;
    cameraMessage.classList.add("show");

    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      cameraMessage.classList.remove("show");
    }, duration);
  }

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }

  cameraVideo.srcObject = null;
}
async function startCamera() {
  stopCamera();

  try {
    // نحاول أولاً الكاميرا المطلوبة
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { exact: currentCamera },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });

  } catch (exactError) {

    console.warn(
      "Exact camera selection failed, trying fallback:",
      exactError
    );

    // Fallback للأجهزة التي لا تدعم exact بشكل جيد
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: currentCamera },
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    });
  }

  cameraVideo.srcObject = cameraStream;
  await cameraVideo.play();
}

async function switchCameraDevice() {

  if (!cameraStream) return;

  // نحفظ الكاميرا الحالية في حالة فشل التبديل
  const previousCamera = currentCamera;

  // نحدد الكاميرا الجديدة
  const nextCamera =
    previousCamera === "environment"
      ? "user"
      : "environment";

  try {

    // نغير الهدف
    currentCamera = nextCamera;

    // نقفل الكاميرا الحالية بالكامل
    stopCamera();

    // نشغل الكاميرا الجديدة
    await startCamera();

    // نتأكد إن فيه Video Track فعلاً
    const videoTrack = cameraStream?.getVideoTracks?.()[0];

    if (!videoTrack) {
      throw new Error("CAMERA_SWITCH_FAILED");
    }

    console.log("Camera switched to:", currentCamera);

  } catch (error) {

    console.error("Switch camera:", error);

    // لو التبديل فشل نرجع للكاميرا القديمة
    currentCamera = previousCamera;

    try {
      await startCamera();
    } catch (restoreError) {
      console.error(
        "Could not restore previous camera:",
        restoreError
      );
    }

    showCameraMessage(
      "We couldn't switch the camera. Please try again.",
      4000
    );
  }
}
  function resetCameraUI() {
    cameraVideo.style.display = "block";
    cameraPreview.style.display = "none";
    cameraControls.style.display = "block";
    previewControls.style.display = "none";
    uploadProgress.style.display = "none";
    uploadProgress.setAttribute("aria-hidden", "true");
    uploadProgressBar.style.width = "0%";
    capturedBlob = null;
  }

  function closeCamera() {
    stopCamera();
    resetCameraUI();
    cameraModal.classList.remove("open");
    cameraModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("camera-open");
  }

  async function openCamera() {

  if (!window.uploadWeddingMemory) {
    showCameraMessage("Please wait a moment and try again.");
    return;
  }

  cameraModal.classList.add("open");
  cameraModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("camera-open");
  resetCameraUI();

  try {

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("CAMERA_UNSUPPORTED");
    }

    await startCamera();

    // Wait until the camera video is actually ready
    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {

      await new Promise((resolve, reject) => {

        const timeout = setTimeout(() => {
          reject(new Error("CAMERA_NOT_READY"));
        }, 5000);

        const checkVideo = () => {

          if (cameraVideo.videoWidth && cameraVideo.videoHeight) {
            clearTimeout(timeout);
            resolve();
          } else {
            requestAnimationFrame(checkVideo);
          }

        };

        checkVideo();

      });

    }

  } catch (error) {

    console.error("Camera:", error);

    stopCamera();

    if (error.name === "NotAllowedError") {

      showCameraMessage(
        "Camera permission was denied. Please allow camera access in your browser settings.",
        6000
      );

    } else if (error.name === "NotFoundError") {

      showCameraMessage(
        "No camera was found on this device.",
        5000
      );

    } else if (error.message === "CAMERA_UNSUPPORTED") {

      showCameraMessage(
        "Camera access is not supported in this browser.",
        5000
      );

    } else {

      showCameraMessage(
        "We couldn't open the camera. Please try again.",
        5000
      );

    }
  }
}

  // Canvas compression + watermark.
  async function createCompressedMemory() {

    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {
      throw new Error("CAMERA_NOT_READY");
    }

    const maxWidth = 1440;
    const scale = Math.min(1, maxWidth / cameraVideo.videoWidth);

    const width = Math.round(cameraVideo.videoWidth * scale);
    const height = Math.round(cameraVideo.videoHeight * scale);

    cameraCanvas.width = width;
    cameraCanvas.height = height;

    const ctx = cameraCanvas.getContext("2d", { alpha: false });

    // Mirror is intentionally NOT applied: rear-camera memories stay natural.
    ctx.drawImage(cameraVideo, 0, 0, width, height);

    // Subtle dark gradient behind the watermark.
    const gradientHeight = Math.round(height * 0.26);
    const gradient = ctx.createLinearGradient(
      0,
      height / 2 - gradientHeight / 2,
      0,
      height / 2 + gradientHeight / 2
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(.5, "rgba(0,0,0,.16)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, height / 2 - gradientHeight / 2, width, gradientHeight);

    const centerX = width / 2;
    const centerY = height / 2;

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.shadowColor = "rgba(0,0,0,.8)";
    ctx.shadowBlur = Math.max(8, width * .008);
    ctx.shadowOffsetY = 2;

    const nameSize = Math.max(42, Math.round(width * .055));
    ctx.font = `400 ${nameSize}px "Great Vibes", "Brush Script MT", cursive`;
    ctx.fillStyle = "rgba(255,248,220,.94)";
    ctx.fillText("Beshoy & Veronia", centerX, centerY);

    ctx.shadowBlur = Math.max(5, width * .004);
    ctx.font = `400 ${Math.max(26, Math.round(width * .026))}px "Cormorant Garamond", Georgia, serif`;
    ctx.fillText("♡", centerX, centerY + nameSize * .72);

    ctx.shadowBlur = Math.max(5, width * .004);
    ctx.font = `500 ${Math.max(14, Math.round(width * .012))}px Montserrat, Arial, sans-serif`;
    ctx.letterSpacing = "4px";
    ctx.fillText("08 • 09 • 2026", centerX, centerY + nameSize * 1.2);

    return await new Promise((resolve, reject) => {

      cameraCanvas.toBlob(
        blob => {
          if (!blob) {
            reject(new Error("COMPRESSION_FAILED"));
            return;
          }

          // JPEG quality is chosen to keep wedding memories visually good
          // while keeping ImageKit storage usage controlled.
          resolve(blob);
        },
        "image/jpeg",
        0.82
      );

    });
  }

async function capturePhoto() {

  try {

    // Wait for the camera to become ready
    if (!cameraVideo.videoWidth || !cameraVideo.videoHeight) {

      showCameraMessage("Preparing camera…");

      await new Promise((resolve, reject) => {

        const timeout = setTimeout(() => {
          reject(new Error("CAMERA_NOT_READY"));
        }, 5000);

        const checkVideo = () => {

          if (cameraVideo.videoWidth && cameraVideo.videoHeight) {
            clearTimeout(timeout);
            resolve();
          } else {
            requestAnimationFrame(checkVideo);
          }

        };

        checkVideo();

      });

    }

    capturedBlob = await createCompressedMemory();

    cameraPreview.src = URL.createObjectURL(capturedBlob);

    cameraVideo.style.display = "none";
    cameraPreview.style.display = "block";

    cameraControls.style.display = "none";
    previewControls.style.display = "flex";

  } catch (error) {

    console.error("Capture:", error);

    showCameraMessage(
      "The camera isn't ready yet. Please try again."
    );

  }
}

  async function keepMemory() {

    if (!capturedBlob) return;

    if (!window.uploadWeddingMemory) {
      showCameraMessage("Please wait for the gallery to connect.");
      return;
    }

    previewControls.style.display = "none";
    uploadProgress.style.display = "block";
    uploadProgress.setAttribute("aria-hidden", "false");
    uploadProgressBar.style.width = "15%";
    uploadProgressText.textContent = "Saving your memory…";

    try {

      uploadProgressBar.style.width = "5%";
      uploadProgressText.textContent = "Uploading your memory…";

      const result = await window.uploadWeddingMemory(capturedBlob, (fraction) => {
        const percent = Math.round(fraction * 100);
        uploadProgressBar.style.width = `${Math.max(5, percent)}%`;
      });

      uploadProgressBar.style.width = "100%";
      uploadProgressText.textContent = "Memory saved 🤍";

      setTimeout(() => {
        closeCamera();

        const memoriesSection = document.getElementById("memories");
        if (memoriesSection) {
          memoriesSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }

      }, 700);

    } catch (error) {

      console.error("Upload:", error);

      uploadProgress.style.display = "none";
      uploadProgress.setAttribute("aria-hidden", "true");

      if (error.message === "MEMORY_LIMIT_REACHED") {
        showCameraMessage(
          "Our Memory Gallery is full 🤍 Thank you for sharing your beautiful memory with us.",
          7000
        );
      } else if (error.message === "IMAGEKIT_PUBLIC_KEY_NOT_CONFIGURED") {
        previewControls.style.display = "flex";
        showCameraMessage(
          "The memory gallery is not connected yet. Please try again later.",
          6000
        );
      } else if (error.message === "IMAGEKIT_AUTH_FAILED" || error.message === "IMAGEKIT_AUTH_INVALID") {
        previewControls.style.display = "flex";
        showCameraMessage(
          "We couldn't connect to the memory gallery. Please try again.",
          6000
        );
      } else {
        previewControls.style.display = "flex";
        showCameraMessage(
          "We couldn't save this memory. Please try again.",
          5000
        );
      }
    }
  }

  cameraFab.addEventListener("click", openCamera);
  cameraClose.addEventListener("click", closeCamera);
  switchCamera.addEventListener("click", switchCameraDevice);
  captureBtn.addEventListener("click", capturePhoto);
  retakeBtn.addEventListener("click", async () => {
    resetCameraUI();

    if (!cameraStream) {
  try {

    await startCamera();

  } catch (error) {

    console.error("Retake camera:", error);

    showCameraMessage(
      "We couldn't reopen the camera. Please close and try again.",
      5000
    );

  }
}
  });
  keepBtn.addEventListener("click", keepMemory);

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && cameraModal.classList.contains("open")) {
      closeCamera();
    }
  });

  // Stop the camera if the page is backgrounded.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && cameraModal.classList.contains("open")) {
      stopCamera();
    }
  });

})();

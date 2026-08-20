import { uploadWeddingImage } from './imagekit.js';

const MAX_MEMORIES = 3000;
const GALLERY_API = '/api/memories';
const memoriesGallery = document.getElementById('memoriesGallery');
const memoriesEmpty = document.getElementById('memoriesEmpty');

function renderMemories(files) {
  if (!memoriesGallery) return;

  memoriesGallery.innerHTML = '';

  const oldPagination = memoriesGallery.parentElement.querySelector(
    '.memories-pagination'
  );

  if (oldPagination) {
    oldPagination.remove();
  }

  if (!files.length) {
    if (memoriesEmpty) memoriesEmpty.style.display = 'block';
    return;
  }

  if (memoriesEmpty) memoriesEmpty.style.display = 'none';

  const isMobile = window.innerWidth <= 768;
  const itemsPerPage = isMobile ? 4 : files.length;

  let currentPage = 1;
  const totalPages = Math.ceil(files.length / itemsPerPage);

  function renderPage(page) {

    memoriesGallery.innerHTML = '';

    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const pageFiles = files.slice(start, end);

    const fragment = document.createDocumentFragment();

    pageFiles.forEach((file) => {

      if (!file.url) return;

      const card = document.createElement('div');
      card.className = 'memory-card';

      const img = document.createElement('img');

      img.src = file.url;
      img.alt = 'Wedding memory';
      img.loading = 'lazy';
      img.decoding = 'async';

      card.appendChild(img);
      fragment.appendChild(card);
    });

    memoriesGallery.appendChild(fragment);

    // ================= PAGINATION =================

    const existingPagination =
      memoriesGallery.parentElement.querySelector(
        '.memories-pagination'
      );

    if (existingPagination) {
      existingPagination.remove();
    }

    if (isMobile && totalPages > 1) {

      const pagination = document.createElement('div');

      pagination.className = 'memories-pagination';

      for (let i = 1; i <= totalPages; i++) {

        const button = document.createElement('button');

        button.type = 'button';
        button.textContent = i;

        if (i === page) {
          button.classList.add('active');
        }

        button.addEventListener('click', () => {

          currentPage = i;

          renderPage(currentPage);

          const section =
            document.getElementById('memories');

          if (section) {
            section.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }

        });

        pagination.appendChild(button);
      }

      memoriesGallery.parentElement.appendChild(pagination);
    }
  }

  renderPage(currentPage);
}

export async function loadMemories() {
  const response = await fetch(GALLERY_API, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store'
  });

  if (!response.ok) throw new Error('MEMORIES_LOAD_FAILED');

  const data = await response.json();
  renderMemories(Array.isArray(data.files) ? data.files : []);
  window.WEDDING_MEMORY_COUNT = Number(data.count || 0);
  window.WEDDING_MEMORY_LIMIT = MAX_MEMORIES;
  return data;
}

window.uploadWeddingMemory = async function (blob, onProgress) {
  if (!(blob instanceof Blob)) throw new Error('Invalid image.');

  const memoryId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const uploadResult = await uploadWeddingImage(
    blob,
    `wedding-memory-${memoryId}.jpg`,
    onProgress
  );

  // Final server-side reconciliation. If concurrent uploads crossed the cap,
  // the backend keeps the gallery at 3,000 and removes the excess upload.
  const reconcileResponse = await fetch(GALLERY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ fileId: uploadResult.fileId })
  });

  if (reconcileResponse.status === 409) {
    throw new Error('MEMORY_LIMIT_REACHED');
  }
  if (!reconcileResponse.ok) throw new Error('MEMORY_RECONCILE_FAILED');

  const result = await reconcileResponse.json();
  await loadMemories();

  return {
    url: uploadResult.url,
    count: result.count,
    countLimit: MAX_MEMORIES
  };
};

loadMemories().catch((error) => {
  console.error('ImageKit memories:', error);
});

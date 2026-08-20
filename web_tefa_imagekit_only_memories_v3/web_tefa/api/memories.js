// ImageKit-only gallery API. No Firebase or database is used for memories.
const MAX_MEMORIES = 3000;
const MEMORY_PATH = '/wedding-memories/';
const IMAGEKIT_FILES_API = 'https://api.imagekit.io/v1/files';
const IMAGEKIT_DELETE_API = 'https://api.imagekit.io/v1/files';

function authHeader(privateKey) {
  return `Basic ${Buffer.from(`${privateKey}:`).toString('base64')}`;
}

async function listMemories(privateKey) {
  const files = [];
  let skip = 0;
  const pageSize = 1000;

  while (skip < MAX_MEMORIES + pageSize) {
    const params = new URLSearchParams({
      path: MEMORY_PATH,
      type: 'file',
      fileType: 'image',
      limit: String(pageSize),
      skip: String(skip),
      sort: 'DESC_CREATED'
    });

    const response = await fetch(`${IMAGEKIT_FILES_API}?${params.toString()}`, {
      headers: { Accept: 'application/json', Authorization: authHeader(privateKey) },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`IMAGEKIT_LIST_FAILED_${response.status}`);

    const page = await response.json();
    if (!Array.isArray(page) || page.length === 0) break;
    files.push(...page);
    if (page.length < pageSize) break;
    skip += page.length;
  }

  return files;
}

function publicFile(file) {
  return {
    fileId: file.fileId,
    url: file.url,
    filePath: file.filePath,
    size: file.size,
    createdAt: file.createdAt
  };
}

module.exports = async function handler(req, res) {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return res.status(500).json({ error: 'ImageKit private key is not configured.' });
  }

  try {
    const files = await listMemories(privateKey);

    if (req.method === 'GET') {
      return res.status(200).json({
        count: files.length,
        limit: MAX_MEMORIES,
        files: files.slice(0, MAX_MEMORIES).map(publicFile)
      });
    }

    if (req.method !== 'POST') {
      res.setHeader('Allow', 'GET, POST');
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const fileId = req.body?.fileId;
    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ error: 'fileId is required.' });
    }

    // If concurrent uploads pushed the folder above the cap, remove this
    // just-uploaded file when it is outside the newest 3,000 files.
    if (files.length > MAX_MEMORIES) {
      const allowedIds = new Set(files.slice(0, MAX_MEMORIES).map(file => file.fileId));
      if (!allowedIds.has(fileId)) {
        const deleteResponse = await fetch(`${IMAGEKIT_DELETE_API}/${encodeURIComponent(fileId)}`, {
          method: 'DELETE',
          headers: { Authorization: authHeader(privateKey) }
        });
        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          throw new Error(`IMAGEKIT_DELETE_FAILED_${deleteResponse.status}`);
        }
        return res.status(409).json({ error: 'MEMORY_LIMIT_REACHED', count: MAX_MEMORIES });
      }
    }

    const finalFiles = files.length > MAX_MEMORIES
      ? files.slice(0, MAX_MEMORIES)
      : files;

    return res.status(200).json({
      count: finalFiles.length,
      limit: MAX_MEMORIES
    });
  } catch (error) {
    console.error('ImageKit memories API:', error);
    return res.status(500).json({ error: 'Could not access the memory gallery.' });
  }
};

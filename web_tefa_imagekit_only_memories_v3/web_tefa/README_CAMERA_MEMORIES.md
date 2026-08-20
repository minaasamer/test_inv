# Wedding Camera + Memories — ImageKit only

## Camera + gallery architecture
- Camera opens full-screen.
- Beshoy & Veronia + wedding date are burned into the captured image.
- Image is resized/compressed in the browser before upload.
- Image files are stored in ImageKit under `/wedding-memories`.
- The gallery reads the ImageKit Media Library through a small Vercel API.
- No Firebase Storage and no Firestore are used for camera memories.
- The application cap is 3,000 images.
- The auth endpoint checks the current ImageKit count before issuing upload credentials.
- A final reconciliation endpoint removes an excess concurrent upload so the folder remains capped at 3,000.

## ImageKit account
- ImageKit ID: `fxoly3nbj`
- URL endpoint: `https://ik.imagekit.io/fxoly3nbj`
- Public key is in `imagekit.js`.
- Private key MUST stay on the server.

## Vercel deployment
1. Import this project into Vercel.
2. In Vercel: Project Settings → Environment Variables.
3. Add:
   `IMAGEKIT_PRIVATE_KEY` = your ImageKit Private Key.
4. Redeploy.

The frontend requests temporary upload authentication from `/api/imagekit-auth`. The gallery uses `/api/memories` to list the ImageKit folder.

Do NOT put the private key in `index.html`, `java.js`, `imagekit.js`, or any public repository.

## Firebase
Firebase is not used by the camera/gallery feature. The existing invitation wishes/comments still use the separate `firebase-wishes.js` module.

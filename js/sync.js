/* Firebase login + Firestore sync. Only loaded features run when firebase-config.js is filled in. */
import { firebaseConfig } from "./firebase-config.js";

const SDK = "https://www.gstatic.com/firebasejs/10.12.2/";
export const configured = !!(firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith("YOUR_"));

let fb = null;

export async function init(onUserChange) {
  if (!configured) return false;
  const [appMod, authMod, fsMod] = await Promise.all([
    import(SDK + "firebase-app.js"),
    import(SDK + "firebase-auth.js"),
    import(SDK + "firebase-firestore.js")
  ]);
  const app = appMod.initializeApp(firebaseConfig);
  const auth = authMod.getAuth(app);
  const db = fsMod.getFirestore(app);
  fb = { auth, db, ...authMod, ...fsMod };
  authMod.getRedirectResult(auth).catch(() => {});
  authMod.onAuthStateChanged(auth, u => onUserChange(u));
  return true;
}

export async function login() {
  if (!fb) throw Object.assign(new Error("Firebase 尚未載入"), { code: "app/not-ready" });
  const provider = new fb.GoogleAuthProvider();
  try {
    await fb.signInWithPopup(fb.auth, provider);
  } catch (e) {
    if (e.code === "auth/popup-blocked" || e.code === "auth/operation-not-supported-in-this-environment") {
      await fb.signInWithRedirect(fb.auth, provider);
    } else throw e;
  }
}

export async function logout() { if (fb) await fb.signOut(fb.auth); }

export async function pull(uid) {
  const snap = await fb.getDoc(fb.doc(fb.db, "users", uid));
  return snap.exists() ? snap.data().progress || null : null;
}

export async function push(uid, progress) {
  await fb.setDoc(fb.doc(fb.db, "users", uid), { progress, updatedAt: fb.serverTimestamp() }, { merge: true });
}

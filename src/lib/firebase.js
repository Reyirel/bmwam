import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

/* ─── Inicialización ──────────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

const app     = initializeApp(firebaseConfig);
const db      = getFirestore(app);
const storage = getStorage(app);

const COLLECTION = 'registros';

/* ─── Generación de código único ──────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomCodigo() {
  return Array.from({ length: 8 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

/**
 * Genera un código de 8 caracteres garantizando que no exista ya en Firestore.
 * Itera hasta encontrar uno libre (en la práctica siempre lo consigue al primer intento).
 */
export async function generateUniqueCodigo() {
  let codigo;
  let intentos = 0;

  do {
    if (intentos > 10) throw new Error('No se pudo generar un código único. Intenta de nuevo.');
    codigo = randomCodigo();
    intentos++;
  } while (!(await isCodigoLibre(codigo)));

  return codigo;
}

async function isCodigoLibre(codigo) {
  const q        = query(collection(db, COLLECTION), where('codigo', '==', codigo), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

/* ─── Storage ─────────────────────────────────────────────────── */

/**
 * Sube el comprobante de pago a Firebase Storage.
 * Ruta: comprobantes/{codigo}/{timestamp}.{ext}
 * Retorna la URL pública de descarga.
 */
export async function uploadComprobante(file, codigo) {
  const ext     = file.name.split('.').pop();
  const path    = `comprobantes/${codigo}/${Date.now()}.${ext}`;
  const fileRef = ref(storage, path);

  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/* ─── Firestore ───────────────────────────────────────────────── */

/**
 * Inserta un nuevo registro en Firestore.
 * Retorna el objeto completo con el id del documento.
 */
export async function insertRegistro(data) {
  const payload = { ...data, created_at: new Date().toISOString() };
  const docRef  = await addDoc(collection(db, COLLECTION), payload);
  return { id: docRef.id, ...payload };
}

/**
 * Busca un registro por su código de 8 caracteres.
 * Usa limit(1) para que Firestore no necesite índice compuesto.
 * Retorna el objeto o null si no existe.
 *
 * IMPORTANTE: Para que este query funcione debes tener el índice
 * de campo simple "codigo" habilitado en Firestore Console →
 * Indexes → Single field → registros / codigo / Ascending.
 * Firestore lo crea automáticamente al primer uso pero si falla
 * consola de Firebase te dará el link directo para crearlo.
 */
export async function getRegistroByCodigo(codigo) {
  const codigoNorm = codigo.trim().toUpperCase();
  const q          = query(
    collection(db, COLLECTION),
    where('codigo', '==', codigoNorm),
    limit(1),
  );
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Retorna todos los registros ordenados del más nuevo al más antiguo.
 *
 * NOTA: el orderBy sobre "created_at" requiere que Firestore tenga
 * el índice de campo simple "created_at" habilitado (se crea solo).
 */
export async function getAllRegistros() {
  const q        = query(collection(db, COLLECTION), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/**
 * Actualiza el campo `estado` de un registro por su ID de documento.
 */
export async function updateEstado(id, estado) {
  const docRef = doc(db, COLLECTION, id);
  await updateDoc(docRef, { estado });
}

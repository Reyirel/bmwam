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
  runTransaction,
  getDoc,
  writeBatch, // added for migration
  setDoc,
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
const COUNTERS_COLLECTION = 'counters';

/* ─── Contador de números de rifa ─────────────────────────────── */

/**
 * Obtiene el siguiente número de rifa disponible usando una transacción
 * para garantizar que no se repitan números.
 * @param {number} cantidad - Cantidad de números a reservar
 * @returns {Promise<number[]>} - Array con los números de rifa asignados
 */
export async function getNextRifaNumbers(cantidad = 1) {
  const counterRef = doc(db, COUNTERS_COLLECTION, 'rifa');
  
  const numbers = await runTransaction(db, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    let currentNumber = 0;
    
    if (counterSnap.exists()) {
      currentNumber = counterSnap.data().lastNumber || 0;
    }
    
    // Reservar los números
    const assignedNumbers = [];
    for (let i = 1; i <= cantidad; i++) {
      assignedNumbers.push(currentNumber + i);
    }
    
    // Actualizar el contador
    tx.set(counterRef, { lastNumber: currentNumber + cantidad }, { merge: true });
    
    return assignedNumbers;
  });
  
  return numbers;
}

/**
 * Obtiene el número de rifa actual (último asignado)
 */
export async function getCurrentRifaNumber() {
  const counterRef = doc(db, COUNTERS_COLLECTION, 'rifa');
  const snap = await getDoc(counterRef);
  if (snap.exists()) {
    return snap.data().lastNumber || 0;
  }
  return 0;
}

/* ─── Generación de código único ──────────────────────────────── */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomCodigo() {
  return Array.from({ length: 8 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join('');
}

async function isCodigoLibre(codigo) {
  const codigoNorm = codigo.trim().toUpperCase();
  // primero verificamos si ya existe un documento con este ID (nuevo esquema)
  const docRef = doc(db, COLLECTION, codigoNorm);
  const snap = await getDoc(docRef);
  if (snap.exists()) return false;

  // también comprobamos cualquier documento antiguo que tenga el campo `codigo`
  const q = query(collection(db, COLLECTION), where('codigo', '==', codigoNorm), limit(1));
  const snapshot = await getDocs(q);
  return snapshot.empty;
}

/**
 * Genera un código de 8 caracteres garantizando que no exista ya en Firestore.
 * Sigue iterando hasta encontrar uno libre. Si hay una colisión en el
 * momento de insertar se volverá a intentar desde el caller.
 */
export async function generateUniqueCodigo() {
  let codigo;
  let intentos = 0;

  do {
    if (intentos > 100) throw new Error('No se pudo generar un código único. Intenta de nuevo.');
    codigo = randomCodigo();
    intentos++;
  } while (!(await isCodigoLibre(codigo)));

  return codigo;
}

/* ─── Storage ─────────────────────────────────────────────────── */

/**
 * Sube el comprobante de pago a Firebase Storage.
 * Ruta: comprobantes/{codigo}/{timestamp}.{ext}
 * Retorna la URL pública de descarga.
 */
export async function uploadComprobante(file, codigo) {
  const ext     = file.name.split('.').pop().toLowerCase();
  const path    = `comprobantes/${codigo}/${Date.now()}.${ext}`;
  const fileRef = ref(storage, path);

  // Especificar el content-type para asegurar que se maneje correctamente
  const metadata = {
    contentType: file.type || (ext === 'pdf' ? 'application/pdf' : `image/${ext === 'jpg' ? 'jpeg' : ext}`),
  };

  await uploadBytes(fileRef, file, metadata);
  return getDownloadURL(fileRef);
}

/* ─── Firestore ───────────────────────────────────────────────── */

/**
 * Inserta un nuevo registro en Firestore.
 * Retorna el objeto completo con el id del documento.
 */
export async function insertRegistro(data) {
  // aseguramos que todo registro comienza en estado "pendiente"
  const payload = { ...data, estado: data.estado || 'pendiente', created_at: new Date().toISOString() };
  const docRef = doc(db, COLLECTION, payload.codigo);

  // usamos transacción para evitar colisiones en la inserción
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(docRef);
    if (snap.exists()) {
      throw new Error('El código ya existe');
    }
    tx.set(docRef, payload);
  });

  return { id: docRef.id, ...payload };
}

/**
 * Busca un registro por su código de 8 caracteres.
 * Ahora se obtiene directamente por ID de documento en lugar de realizar
 * una consulta, eliminando la necesidad de índices y evitando posibles
 * problemas de consulta.
 */
export async function getRegistroByCodigo(codigo) {
  const codigoNorm = codigo.trim().toUpperCase();

  // intentamos obtener por ID primero (rinde mejor y no requiere índices)
  const docRef = doc(db, COLLECTION, codigoNorm);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() };
  }

  // fallback: buscar por campo en documentos antiguos
  const q = query(
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

/**
 * Migra documentos antiguos cuyo ID no coincide con el código guardado.
 * Crea nuevos documentos con el código como ID y elimina los viejos.
 * Úsalo sólo una vez, desde un entorno administrativo (por ejemplo un
 * script de Node o desde el panel de admin) y asegúrate de tener backup.
 */
export async function migrateRegistrosToCodigoId() {
  const snaps = await getDocs(collection(db, COLLECTION));
  const batch = writeBatch(db);
  snaps.forEach((ds) => {
    const data = ds.data();
    if (data.codigo && ds.id !== data.codigo) {
      const newRef = doc(db, COLLECTION, data.codigo);
      batch.set(newRef, data);
      batch.delete(ds.ref);
    }
  });
  await batch.commit();
}

/**
 * Obtiene las credenciales del administrador desde Firestore. Si no existe
 * el documento, crea uno con valores por defecto (correo y contraseña
 * especificados en el requerimiento) para facilitar el primer despliegue.
 *
 * El documento se guarda en la colección `admin` con ID `main`.
 */
export async function getAdminCredentials() {
  const adminRef = doc(db, 'admin', 'main');
  const snap = await getDoc(adminRef);
  if (snap.exists()) {
    return snap.data();
  }
  // Si no hay credenciales en la base de datos, creamos las predeterminadas.
  const defaultCred = {
    email: 'bmwam@ixmiquilpan.com',
    password: 'bmwam24.27',
  };
  await setDoc(adminRef, defaultCred);
  return defaultCred;
}

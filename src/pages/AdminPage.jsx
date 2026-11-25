// Panel de administración de TRIPLE R: productos (con stock por talla) y pedidos.
// Solo entra quien tenga un documento en `admins/{uid}` en Firestore
// (se crea a mano desde la consola de Firebase; ver README).

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc, collection, doc, getDoc, onSnapshot, serverTimestamp, updateDoc, writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import { seedArtists, seedProducts, SIZES, ONE_SIZE, sizesOf, totalStock } from '../data/catalogSeed';
import { assetNames, resolveImage } from '../data/images';
import './AdminPage.css';

const ORDER_STATUSES = ['pendiente', 'pagado', 'enviado', 'entregado', 'cancelado'];

const toDate = v => (v?.toDate ? v.toDate() : v ? new Date(v) : null);

function AdminPage() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [tab, setTab] = useState('productos');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'admins', user.uid))
      .then(snap => setIsAdmin(snap.exists()))
      .catch(() => setIsAdmin(false));
  }, [user]);

  if (!user) {
    return (
      <div className="admin-page">
        <h1>Administración</h1>
        <p>Inicia sesión para entrar. <Link to="/login">Iniciar sesión</Link></p>
      </div>
    );
  }

  if (isAdmin === null) {
    return <div className="admin-page"><p>Revisando permisos...</p></div>;
  }

  if (!isAdmin) {
    return (
      <div className="admin-page">
        <h1>Administración</h1>
        <p>Tu cuenta no es administradora.</p>
        <p className="admin-hint">
          Para darle acceso, en la consola de Firebase crea un documento en la colección
          <code> admins </code> con este id: <code>{user.uid}</code>
        </p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h1>Administración</h1>
      <div className="admin-tabs">
        <button className={tab === 'productos' ? 'active' : ''} onClick={() => setTab('productos')}>Productos</button>
        <button className={tab === 'pedidos' ? 'active' : ''} onClick={() => setTab('pedidos')}>Pedidos</button>
      </div>
      {tab === 'productos' ? <ProductsAdmin /> : <OrdersAdmin />}
    </div>
  );
}

// ---------- Productos ----------

function ProductsAdmin() {
  const [products, setProducts] = useState(null);
  const [artists, setArtists] = useState([]);
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const unsubP = onSnapshot(
      collection(db, 'products'),
      snap => setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id }))
        .sort((a, b) => (a.orden ?? 999) - (b.orden ?? 999))),
      err => setError(err.message)
    );
    const unsubA = onSnapshot(
      collection(db, 'artists'),
      snap => setArtists(snap.docs.map(d => ({ ...d.data(), id: d.id }))),
      err => setError(err.message)
    );
    return () => { unsubP(); unsubA(); };
  }, []);

  const importSeed = async () => {
    setImporting(true);
    setError('');
    try {
      const batch = writeBatch(db);
      seedProducts.forEach(({ id, ...data }) =>
        batch.set(doc(db, 'products', id), { ...data, actualizado: serverTimestamp() }));
      seedArtists.forEach(({ id, ...data }) =>
        batch.set(doc(db, 'artists', id), data));
      await batch.commit();
    } catch (err) {
      setError(err.message);
    }
    setImporting(false);
  };

  if (error) return <p className="admin-error">Error: {error}</p>;
  if (products === null) return <p>Cargando productos...</p>;

  const artistOptions = artists.length ? artists : seedArtists;

  return (
    <>
      {products.length === 0 && (
        <div className="admin-card">
          <p>No hay productos en Firestore todavía. La tienda está mostrando el catálogo del código.</p>
          <button className="admin-primary" onClick={importSeed} disabled={importing}>
            {importing ? 'Importando...' : 'Importar catálogo inicial (7 productos y 6 artistas)'}
          </button>
          <p className="admin-hint">Se importan con 10 piezas por talla. Cámbialo abajo después de importar.</p>
        </div>
      )}

      <div className="admin-list">
        {products.map(p => <ProductRow key={p.id} product={p} artists={artistOptions} />)}
      </div>

      <NewProductForm artists={artistOptions} nextOrder={products.length + 1} />
    </>
  );
}

function ProductRow({ product, artists }) {
  const [draft, setDraft] = useState(product);
  const [status, setStatus] = useState('');

  // Si alguien más cambia el producto, refleja el cambio mientras no haya edición pendiente.
  useEffect(() => { if (!status.startsWith('sin')) setDraft(product); }, [product]); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = changes => { setDraft(d => ({ ...d, ...changes })); setStatus('sin guardar'); };
  const setStock = (size, value) =>
    edit({ stock: { ...draft.stock, [size]: Math.max(0, parseInt(value, 10) || 0) } });

  const save = async () => {
    setStatus('guardando...');
    try {
      await updateDoc(doc(db, 'products', product.id), {
        nombre: draft.nombre.trim(),
        precio: Number(draft.precio) || 0,
        descripcion: draft.descripcion || '',
        artist: draft.artist,
        imagen: draft.imagen,
        stock: draft.stock || {},
        activo: draft.activo !== false,
        actualizado: serverTimestamp(),
      });
      setStatus('guardado');
    } catch (err) {
      setStatus('error: ' + err.message);
    }
  };

  const sizes = sizesOf(draft);
  const total = totalStock(draft);

  return (
    <div className={`admin-card admin-product ${draft.activo === false ? 'inactive' : ''}`}>
      <img src={resolveImage(draft.imagen)} alt="" />
      <div className="admin-product-fields">
        <div className="admin-row">
          <input className="grow" value={draft.nombre} onChange={e => edit({ nombre: e.target.value })} aria-label="Nombre" />
          <label>$ <input type="number" min="0" value={draft.precio} onChange={e => edit({ precio: e.target.value })} className="narrow" aria-label="Precio" /></label>
          <select value={draft.artist} onChange={e => edit({ artist: e.target.value })} aria-label="Artista">
            {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="admin-row">
          <span className="admin-label">Stock:</span>
          {sizes.map(s => (
            <label key={s} className="admin-stock">
              {s === ONE_SIZE ? 'Única' : s}
              <input type="number" min="0" value={draft.stock?.[s] ?? 0} onChange={e => setStock(s, e.target.value)} />
            </label>
          ))}
          <span className={total === 0 ? 'admin-soldout' : 'admin-total'}>{total === 0 ? 'Agotado' : `${total} en total`}</span>
        </div>
        <div className="admin-row">
          <label><input type="checkbox" checked={draft.activo !== false} onChange={e => edit({ activo: e.target.checked })} /> Visible en la tienda</label>
          <button className="admin-primary" onClick={save} disabled={!status.startsWith('sin')}>Guardar</button>
          <span className="admin-status">{status}</span>
        </div>
      </div>
    </div>
  );
}

const emptyProduct = {
  nombre: '', precio: 250, descripcion: '', artist: '', tipo: 'playera', imagen: '',
};

function NewProductForm({ artists, nextOrder }) {
  const [form, setForm] = useState(emptyProduct);
  const [stock, setStock] = useState(Object.fromEntries(SIZES.map(s => [s, 0])));
  const [status, setStatus] = useState('');
  const set = changes => setForm(f => ({ ...f, ...changes }));

  const sizes = form.tipo === 'playera' ? SIZES : [ONE_SIZE];

  const submit = async e => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.artist || !form.imagen) {
      setStatus('Falta nombre, artista o imagen.');
      return;
    }
    setStatus('guardando...');
    try {
      await addDoc(collection(db, 'products'), {
        ...form,
        nombre: form.nombre.trim(),
        precio: Number(form.precio) || 0,
        stock: Object.fromEntries(sizes.map(s => [s, Number(stock[s]) || 0])),
        activo: true,
        orden: nextOrder,
        actualizado: serverTimestamp(),
      });
      setForm(emptyProduct);
      setStock(Object.fromEntries(SIZES.map(s => [s, 0])));
      setStatus('Producto creado.');
    } catch (err) {
      setStatus('error: ' + err.message);
    }
  };

  return (
    <form className="admin-card admin-new" onSubmit={submit}>
      <h2>Nuevo producto</h2>
      <div className="admin-row">
        <input className="grow" placeholder="Nombre" value={form.nombre} onChange={e => set({ nombre: e.target.value })} />
        <label>$ <input type="number" min="0" className="narrow" value={form.precio} onChange={e => set({ precio: e.target.value })} /></label>
      </div>
      <div className="admin-row">
        <select value={form.artist} onChange={e => set({ artist: e.target.value })}>
          <option value="">Artista...</option>
          {artists.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={form.tipo} onChange={e => set({ tipo: e.target.value })}>
          <option value="playera">Playera (tallas CH-EG)</option>
          <option value="bolsa">Bolsa / talla única</option>
        </select>
      </div>
      <input placeholder="Descripción" value={form.descripcion} onChange={e => set({ descripcion: e.target.value })} />
      <div className="admin-row">
        <input className="grow" list="admin-assets" placeholder="Imagen: archivo de src/assets o URL https://" value={form.imagen} onChange={e => set({ imagen: e.target.value })} />
        <datalist id="admin-assets">{assetNames.map(n => <option key={n} value={n} />)}</datalist>
        {resolveImage(form.imagen) && <img className="admin-preview" src={resolveImage(form.imagen)} alt="" />}
      </div>
      <div className="admin-row">
        <span className="admin-label">Stock:</span>
        {sizes.map(s => (
          <label key={s} className="admin-stock">
            {s === ONE_SIZE ? 'Única' : s}
            <input type="number" min="0" value={stock[s] ?? 0} onChange={e => setStock(st => ({ ...st, [s]: e.target.value }))} />
          </label>
        ))}
      </div>
      <div className="admin-row">
        <button className="admin-primary" type="submit">Crear producto</button>
        <span className="admin-status">{status}</span>
      </div>
    </form>
  );
}

// ---------- Pedidos ----------

function OrdersAdmin() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => onSnapshot(
    collection(db, 'orders'),
    snap => setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }))
      .sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0))),
    err => setError(err.message)
  ), []);

  const setStatus = (id, status) =>
    updateDoc(doc(db, 'orders', id), { status }).catch(err => setError(err.message));

  if (error) return <p className="admin-error">Error: {error}</p>;
  if (orders === null) return <p>Cargando pedidos...</p>;
  if (orders.length === 0) return <p>Todavía no hay pedidos. Se crearán cuando el pago con Stripe esté conectado.</p>;

  return (
    <div className="admin-list">
      {orders.map(o => (
        <div key={o.id} className="admin-card admin-order">
          <div className="admin-row">
            <strong>#{o.id.slice(0, 8)}</strong>
            <span>{toDate(o.createdAt)?.toLocaleString('es-MX') || 'sin fecha'}</span>
            <span>{o.email || o.shipping?.name || o.userId || ''}</span>
            <span className="admin-total">${o.total ?? '—'}</span>
            <select value={o.status || 'pendiente'} onChange={e => setStatus(o.id, e.target.value)}>
              {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <ul>
            {(o.items || []).map((it, i) => (
              <li key={i}>
                {it.quantity} × {it.nombre}
                {it.selectedSize && it.selectedSize !== ONE_SIZE ? ` (${it.selectedSize})` : ''}
                {it.selectedCut && it.selectedCut !== 'regular' ? ` · ${it.selectedCut}` : ''}
              </li>
            ))}
          </ul>
          {o.sobreventa?.length > 0 && (
            <p className="admin-error">
              Sobreventa: no alcanzó el stock para{' '}
              {o.sobreventa.map(x => (typeof x === 'string' ? x : [x.nombre || x.productId, x.selectedSize].filter(Boolean).join(' '))).join(', ')}
            </p>
          )}
          {o.cancelReason && <p className="admin-hint">Motivo de cancelación: {o.cancelReason}</p>}
          {o.shipping && (
            <p className="admin-hint">
              {[o.shipping.name, o.shipping.address, o.shipping.city, o.shipping.state, o.shipping.zip, o.shipping.phone]
                .filter(Boolean).join(', ')}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default AdminPage;

// Muestra un dato legal o, si todavía no se llena en src/data/legal.js,
// un aviso amarillo para que no se publique sin revisar.
function Dato({ value, label }) {
  if (value !== null && value !== undefined && value !== '') return <>{value}</>;
  return <mark className="legal-pendiente">[PENDIENTE: {label}]</mark>;
}

export default Dato;

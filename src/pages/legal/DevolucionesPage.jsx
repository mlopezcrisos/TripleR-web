import LegalPage from './LegalPage';
import Dato from './Dato';
import { LEGAL } from '../../data/legal';

function DevolucionesPage() {
  const { devoluciones: d } = LEGAL;
  const correo = <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a>;
  return (
    <LegalPage title="Cambios y devoluciones">
      <h2>Plazo</h2>
      <p>
        Tienes <Dato value={d.diasParaSolicitar} label="días para solicitar" /> días naturales a partir de que
        recibes tu pedido para solicitar un cambio de talla o una devolución.
      </p>

      <h2>Condiciones</h2>
      <ul>
        <li>La prenda debe estar sin usar, sin lavar, sin olores y con sus etiquetas.</li>
        <li>Debes enviarla en un empaque que la proteja durante el traslado.</li>
        <li>
          Los cambios de talla están sujetos a existencias. Si no hay la talla que buscas, te reembolsamos.
        </li>
        <li>No aceptamos devoluciones de productos personalizados ni de artículos en liquidación, salvo por defecto.</li>
      </ul>

      <h2>Productos defectuosos o equivocados</h2>
      <p>
        Si recibiste un producto con defecto de fabricación, o una talla o diseño distinto al que pediste,
        escríbenos con fotos. En esos casos nosotros cubrimos el envío de regreso y el del cambio, y te
        reembolsamos si así lo prefieres.
      </p>

      <h2>Cómo solicitarlo</h2>
      <ol>
        <li>Escríbenos a {correo} con tu número de pedido, el producto y el motivo.</li>
        <li>Te responderemos con las instrucciones y la dirección para enviar la prenda.</li>
        <li>
          En cambios o devoluciones que no se deban a un error nuestro, el envío de regreso lo paga{' '}
          <Dato value={d.pagaEnvioRegreso} label="quién paga el envío de regreso" />.
        </li>
        <li>Cuando recibamos y revisemos la prenda, te enviamos el cambio o hacemos el reembolso.</li>
      </ol>

      <h2>Reembolsos</h2>
      <p>
        Los reembolsos se hacen al mismo medio de pago que usaste, dentro de los{' '}
        <Dato value={d.diasReembolso} label="días para reembolsar" /> días hábiles siguientes a que aprobemos la
        devolución. Según tu banco, el dinero puede tardar unos días más en reflejarse.
      </p>

      <h2>Cancelaciones</h2>
      <p>
        Puedes cancelar tu pedido sin costo mientras no haya salido. Escríbenos a {correo} y te reembolsamos el
        total.
      </p>
    </LegalPage>
  );
}

export default DevolucionesPage;

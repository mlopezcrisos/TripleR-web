import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import Dato from './Dato';
import { LEGAL } from '../../data/legal';

function TerminosPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        Estos términos regulan el uso de {LEGAL.sitio} (la "Tienda") y las compras que hagas en ella.
        Al navegar o comprar en la Tienda aceptas estos términos. Si no estás de acuerdo, por favor no la uses.
      </p>

      <h2>1. Quién vende</h2>
      <p>
        La Tienda es operada por <Dato value={LEGAL.razonSocial} label="nombre o razón social" />,
        con RFC <Dato value={LEGAL.rfc} label="RFC" /> y domicilio en <Dato value={LEGAL.domicilio} label="domicilio" />,
        bajo el nombre comercial {LEGAL.nombreComercial}. Puedes contactarnos en{' '}
        <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a>.
      </p>

      <h2>2. Cuenta de usuario</h2>
      <p>
        Puedes comprar como invitado o crear una cuenta. Si creas una, eres responsable de mantener tu
        contraseña en secreto y de la actividad que ocurra con ella. Debes ser mayor de edad o contar con el
        permiso de tu madre, padre o tutor para comprar.
      </p>

      <h2>3. Productos y precios</h2>
      <ul>
        <li>Todos los precios están en pesos mexicanos (MXN) e incluyen impuestos.</li>
        <li>
          Las fotos son ilustrativas. El color puede variar ligeramente según tu pantalla. Revisa la guía de
          tallas antes de comprar.
        </li>
        <li>
          Las existencias son limitadas. Si un producto se agota después de que pagaste, te avisaremos y te
          ofreceremos un cambio o el reembolso completo.
        </li>
        <li>
          Podemos corregir errores evidentes de precio o de descripción. Si ya pagaste un pedido afectado, te
          avisaremos y podrás cancelarlo con reembolso completo.
        </li>
      </ul>

      <h2>4. Pedidos y pagos</h2>
      <p>
        Los pagos se procesan a través de Stripe, un proveedor certificado. La Tienda nunca ve ni guarda los
        datos completos de tu tarjeta. Tu pedido queda confirmado cuando el pago se acredita; entonces te
        enviaremos un correo de confirmación con el número de pedido. Si eliges un método de pago diferido,
        el pedido se aparta hasta que el pago se refleje o venza su plazo.
      </p>

      <h2>5. Envíos, cambios y devoluciones</h2>
      <p>
        Los plazos y costos de envío están en la <Link to="/envios">Política de envíos</Link>. Las condiciones
        para cambios, devoluciones y reembolsos están en la <Link to="/devoluciones">Política de cambios y
        devoluciones</Link>. Ambas forman parte de estos términos.
      </p>

      <h2>6. Propiedad intelectual</h2>
      <p>
        Los nombres, imágenes y diseños de los artistas pertenecen a sus respectivos titulares. El logotipo,
        los textos y el diseño del sitio pertenecen a {LEGAL.nombreComercial}. No puedes copiarlos ni usarlos
        con fines comerciales sin autorización por escrito.
      </p>

      <h2>7. Uso correcto del sitio</h2>
      <p>
        No está permitido usar la Tienda para fines ilícitos, intentar acceder a cuentas o sistemas ajenos,
        ni hacer compras con medios de pago que no te pertenezcan. Podemos cancelar pedidos o cuentas
        relacionados con estas conductas.
      </p>

      <h2>8. Datos personales</h2>
      <p>
        Tratamos tus datos conforme a nuestro <Link to="/privacidad">Aviso de privacidad</Link>.
      </p>

      <h2>9. Cambios a estos términos</h2>
      <p>
        Podemos actualizar estos términos. La versión vigente es la publicada en esta página, y aplica a las
        compras hechas a partir de su fecha de actualización.
      </p>

      <h2>10. Ley aplicable y quejas</h2>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos, en particular la Ley Federal
        de Protección al Consumidor. Si tienes un problema con tu compra, escríbenos primero a{' '}
        <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a> y buscaremos resolverlo. También puedes acudir a
        la Procuraduría Federal del Consumidor (Profeco).
      </p>
    </LegalPage>
  );
}

export default TerminosPage;

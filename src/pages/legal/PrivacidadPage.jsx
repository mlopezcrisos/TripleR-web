import LegalPage from './LegalPage';
import Dato from './Dato';
import { LEGAL } from '../../data/legal';

function PrivacidadPage() {
  const correo = <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a>;
  return (
    <LegalPage title="Aviso de privacidad">
      <p>
        Este aviso se emite conforme a la Ley Federal de Protección de Datos Personales en Posesión de los
        Particulares, su reglamento y demás normativa aplicable.
      </p>

      <h2>1. Responsable</h2>
      <p>
        <Dato value={LEGAL.razonSocial} label="nombre o razón social" /> ("{LEGAL.nombreComercial}"), con
        domicilio en <Dato value={LEGAL.domicilio} label="domicilio" />, es responsable del tratamiento de tus
        datos personales. Contacto para temas de privacidad: {correo}.
      </p>

      <h2>2. Datos que recabamos</h2>
      <ul>
        <li><strong>Identificación y contacto:</strong> nombre, correo electrónico y teléfono.</li>
        <li><strong>Envío:</strong> calle y número, colonia, ciudad, estado y código postal.</li>
        <li>
          <strong>Cuenta:</strong> correo y contraseña (la contraseña la guarda cifrada nuestro proveedor de
          autenticación) o los datos básicos de tu cuenta de Google si inicias sesión con ella.
        </li>
        <li><strong>Compras:</strong> productos, tallas, montos, fecha y estado de tus pedidos.</li>
        <li>
          <strong>Pago:</strong> los datos de tu tarjeta los recibe directamente Stripe. Nosotros solo
          recibimos la confirmación del pago, el monto y una referencia.
        </li>
      </ul>
      <p>No recabamos datos personales sensibles.</p>

      <h2>3. Para qué usamos tus datos</h2>
      <p>Finalidades necesarias para la relación contigo:</p>
      <ul>
        <li>Procesar, cobrar, preparar y enviar tus pedidos.</li>
        <li>Enviarte la confirmación de tu compra y avisos sobre su estado.</li>
        <li>Atender cambios, devoluciones, aclaraciones y garantías.</li>
        <li>Administrar tu cuenta y tu carrito.</li>
        <li>Prevenir fraudes y cumplir obligaciones legales y fiscales.</li>
      </ul>
      <p>Finalidades adicionales, que no son necesarias para tu compra:</p>
      <ul>
        <li>Enviarte novedades, lanzamientos y promociones.</li>
      </ul>
      <p>
        Si no quieres que usemos tus datos para las finalidades adicionales, escríbenos a {correo} con el
        asunto "No enviar promociones". Negarte no afecta tus compras.
      </p>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>Compartimos tus datos solo con proveedores que nos ayudan a operar la Tienda:</p>
      <ul>
        <li><strong>Stripe</strong>, para procesar pagos.</li>
        <li>
          <strong>Google Firebase</strong>, para autenticación y para guardar pedidos y carritos (sus
          servidores están en Estados Unidos).
        </li>
        <li><strong>Vercel</strong>, para alojar el sitio.</li>
        <li>
          <strong>Paqueterías</strong> (<Dato value={LEGAL.envio.paqueterias} label="paqueterías" />), que
          reciben tu nombre, dirección y teléfono para entregar tu pedido.
        </li>
        <li><strong>Proveedor de correo electrónico</strong>, para enviarte la confirmación de tu pedido.</li>
      </ul>
      <p>
        Estas transferencias son necesarias para cumplir tu compra, por lo que no requieren tu consentimiento.
        También podremos compartir datos con autoridades cuando una ley lo exija. No vendemos tus datos.
      </p>

      <h2>5. Tus derechos ARCO y cómo ejercerlos</h2>
      <p>
        Puedes acceder a tus datos, rectificarlos, cancelarlos u oponerte a su uso (derechos ARCO), así como
        revocar tu consentimiento o limitar su uso. Para hacerlo, envía un correo a {correo} con:
      </p>
      <ul>
        <li>Tu nombre y un correo para responderte.</li>
        <li>Una copia de tu identificación oficial (o la de tu representante y el documento que lo acredite).</li>
        <li>Qué derecho quieres ejercer y sobre qué datos.</li>
      </ul>
      <p>
        Te responderemos en un máximo de 20 días hábiles y, si procede, aplicaremos el cambio dentro de los
        15 días hábiles siguientes. Algunos datos tendremos que conservarlos por obligaciones fiscales.
      </p>

      <h2>6. Cookies y almacenamiento local</h2>
      <p>
        Usamos el almacenamiento de tu navegador para recordar tu carrito, tus datos de envío y tu sesión.
        No usamos cookies de publicidad. Puedes borrar estos datos desde la configuración de tu navegador,
        aunque entonces se vaciará tu carrito.
      </p>

      <h2>7. Cambios a este aviso</h2>
      <p>
        Cualquier cambio a este aviso se publicará en esta página con su nueva fecha de actualización.
      </p>

      <h2>8. Autoridad</h2>
      <p>
        Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir a la autoridad
        competente en materia de protección de datos personales.
      </p>
    </LegalPage>
  );
}

export default PrivacidadPage;

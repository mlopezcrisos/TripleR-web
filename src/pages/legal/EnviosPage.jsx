import { Link } from 'react-router-dom';
import LegalPage from './LegalPage';
import Dato from './Dato';
import { LEGAL } from '../../data/legal';

function EnviosPage() {
  const { envio } = LEGAL;
  return (
    <LegalPage title="Política de envíos">
      <h2>Cobertura</h2>
      <p>{envio.cobertura}</p>

      <h2>Costo</h2>
      <p><Dato value={envio.costo} label="costo de envío" />. El costo final siempre se muestra antes de pagar.</p>

      <h2>Tiempos</h2>
      <ul>
        <li>
          Preparamos tu pedido en <Dato value={envio.diasPreparacion} label="días de preparación" /> días
          hábiles después de que se confirma el pago.
        </li>
        <li>
          Una vez enviado, la paquetería tarda de <Dato value={envio.diasEntrega} label="días de entrega" />{' '}
          días hábiles en entregarlo, según tu código postal.
        </li>
        <li>
          En lanzamientos, preventas o temporadas altas los tiempos pueden ser mayores. Si es así, lo
          indicaremos en el producto.
        </li>
      </ul>

      <h2>Paqueterías y rastreo</h2>
      <p>
        Enviamos con <Dato value={envio.paqueterias} label="paqueterías" />. Cuando tu pedido salga te
        mandaremos por correo el número de guía para que lo rastrees.
      </p>

      <h2>Dirección de entrega</h2>
      <p>
        Revisa que tu dirección y teléfono estén completos y correctos. Si necesitas corregirlos, escríbenos a{' '}
        <a href={`mailto:${LEGAL.correo}`}>{LEGAL.correo}</a> antes de que el pedido salga. Si un paquete
        regresa por una dirección incorrecta o porque nadie lo recibió, el reenvío puede tener costo.
      </p>

      <h2>Paquetes dañados o extraviados</h2>
      <p>
        Si tu paquete llega abierto o dañado, tómale fotos antes de abrirlo y escríbenos dentro de las 48 horas
        siguientes a la entrega. Si la paquetería lo da por extraviado, te enviamos uno nuevo o te reembolsamos
        el total. Consulta también nuestra <Link to="/devoluciones">política de cambios y devoluciones</Link>.
      </p>
    </LegalPage>
  );
}

export default EnviosPage;

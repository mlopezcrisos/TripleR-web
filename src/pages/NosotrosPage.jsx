

function NosotrosPage() {
  
  const pageStyles = {
    padding: '2rem 4rem',
    maxWidth: '800px',
    margin: '0 auto', 
    textAlign: 'center',
    lineHeight: '1.6',
  };

  const titleStyles = {
    color: 'var(--amarillo-acento)',
    fontSize: '3rem',
    textTransform: 'uppercase',
  };

  return (
    <div style={pageStyles}>
      <h1 style={titleStyles}>Nuestra Historia</h1>
      <p>
        Triple R nació de la pasión por la música en vivo y la necesidad de llevar un recuerdo tangible de esas noches inolvidables. 
        No somos solo una tienda, somos fans creando para fans. Cada diseño está inspirado en la energía del moshpit, el rugido de la multitud y la conexión única entre el artista y su público.
      </p>
      <p>
        Buscamos la mejor calidad para que la merch de tu banda favorita te dure tanto como los recuerdos. ¡Gracias por ser parte de esta comunidad!
      </p>
    </div>
  );
}

export default NosotrosPage;
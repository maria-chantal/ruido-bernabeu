Promise.all([
  d3.json("/datos/impacto_urbano.json"),
  d3.json("/datos/turismo.json"),
  d3.json("/datos/transporte.json"),
])
  .then(([impactoData, turismoData, transporteData]) => {
    console.log("Impacto Urbano:", impactoData);
    console.log("Turismo:", turismoData);
    console.log("Transporte:", transporteData);

    const impacto = impactoData.impacto_urbano;
    const turismo = turismoData.turismo;
    const transporte = transporteData.transporte;

    // Verifica que hay datos en los arrays
    if (
      impacto.length === 0 ||
      turismo.length === 0 ||
      transporte.length === 0
    ) {
      console.error("Error: Algún dataset está vacío.");
      return;
    }
    const meses = {
      ENE: "Jan",
      FEB: "Feb",
      MAR: "Mar",
      ABR: "Apr",
      MAY: "May",
      JUN: "Jun",
      JUL: "Jul",
      AGO: "Aug",
      SEP: "Sep",
      OCT: "Oct",
      NOV: "Nov",
      DIC: "Dec",
    };

    const parseDate = d3.timeParse("%Y/%m-%b");

    let datos = impacto.map((item, index) => {
      let fechaStr = item.ID_Impacto;
      let [anio, mesTexto] = fechaStr.split("/");
      let mesNombre = meses[mesTexto.split("-")[1]]; // "ENE" -> "Jan"
      let fechaParseable = `${anio}/${mesTexto.split("-")[0]}-${mesNombre}`;
      let fecha = parseDate(fechaParseable);

      if (!fecha) {
        console.error("Fecha inválida encontrada:", fechaStr);
        return null; 
      }

      return {
        fecha: fecha || new Date(),
        nivel_ruido: parseFloat(item.Nivel_Ruido) || 0,
        nivel_contaminacion: parseFloat(item.Nivel_Contaminacion) || 0,
        turistas: parseInt(turismo[index]?.Turistas_Internacionales) || 0,
        viajeros: parseFloat(transporte[index]?.Viajeros) || 0,
      };
    });

    datos = datos
      .filter((d) => !isNaN(d.fecha))
      .sort((a, b) => a.fecha - b.fecha);
    datos = datos.filter((d) => d && d.fecha);
    
    create(datos);
  })
  .catch((error) => console.error("Error cargando los datos:", error));

function create(datos) {
    // Encontrar valores máximos para normalización
  let maxNivelRuido = d3.max(datos, (d) => d.nivel_ruido);
  let maxNivelContaminacion = d3.max(datos, (d) => d.nivel_contaminacion);
  let maxTuristas = d3.max(datos, (d) => d.turistas);
  let maxViajeros = d3.max(datos, (d) => d.viajeros);

  // Normalizar cada conjunto de datos
  datos.forEach((d) => {
    d.nivel_ruido = (d.nivel_ruido / maxNivelRuido) * 100;
    d.nivel_contaminacion =
      (d.nivel_contaminacion / maxNivelContaminacion) * 100;
    d.turistas = (d.turistas / maxTuristas) * 100;
    d.viajeros = (d.viajeros / maxViajeros) * 100;
  });

  const svgWidth = 800,
    svgHeight = 500;
  const margin = { top: 20, right: 110, bottom: 50, left: 20 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  const svg = d3
    .select("#turismo_contaminacion_viajeros")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Escalas
  const x = d3
    .scaleTime()
    .domain(d3.extent(datos, (d) => d.fecha))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(datos, (d) =>
        Math.max(d.nivel_ruido, d.nivel_contaminacion, d.turistas, d.viajeros)
      ),
    ])
    .range([height, 0]);

  // Ejes
  svg
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  svg.append("g").call(d3.axisLeft(y));

  // Línea de nivel de ruido
  const lineRuido = d3
    .line()
    .x((d) => x(d.fecha))
    .y((d) => y(d.nivel_ruido));

  svg
    .append("path")
    .datum(datos)
    .attr("fill", "none")
    .attr("stroke", "#F940F6")
    .attr("stroke-width", 2)
    .attr("d", lineRuido);

  // Línea de nivel de contaminacion aire
  const lineContaminacion = d3
    .line()
    .x((d) => x(d.fecha))
    .y((d) => y(d.nivel_contaminacion));

  svg
    .append("path")
    .datum(datos)
    .attr("fill", "none")
    .attr("stroke", "#E7265F")
    .attr("stroke-width", 2)
    .attr("d", lineContaminacion);

  // Línea de turistas
  const lineTuristas = d3
    .line()
    .x((d) => x(d.fecha))
    .y((d) => y(d.turistas));

  svg
    .append("path")
    .datum(datos)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineTuristas);

  // Línea de viajeros (transporte)
  const lineViajeros = d3
    .line()
    .x((d) => x(d.fecha))
    .y((d) => y(d.viajeros));

  svg
    .append("path")
    .datum(datos)
    .attr("fill", "none")
    .attr("stroke", "#EEEB11")
    .attr("stroke-width", 2)
    .attr("d", lineViajeros);

  // Agregar leyenda
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 20}, ${height - 100})`);

  legend
    .append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "#F940F6");
  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Ruido")
    .attr("fill", "black");

  legend
    .append("rect")
    .attr("y", 20)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "steelblue");
  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 30)
    .text("Turistas")
    .attr("fill", "black");

  legend
    .append("rect")
    .attr("y", 40)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "#EEEB11");
  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 50)
    .text("Viajeros")
    .attr("fill", "black");

  legend
    .append("rect")
    .attr("y", 60)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", "#E7265F");
  legend
    .append("text")
    .attr("x", 20)
    .attr("y", 70)
    .text("Contaminacion aire")
    .attr("fill", "black");
}

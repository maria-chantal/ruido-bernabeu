Promise.all([
    d3.json("/datos/impacto_urbano.json"),
    d3.json("/datos/turismo.json")
]).then(([impactoData, turismoData]) => {

    console.log("Impacto Urbano:", impactoData);
    console.log("Turismo:", turismoData);

    const impacto = impactoData.impacto_urbano;
    const turismo = turismoData.turismo;

    if (impacto.length === 0 || turismo.length === 0) {
        console.error("Error: Algún dataset está vacío.");
        return;
    }

    // Mapeo de meses
    const meses = {
        "ENE": "Jan", "FEB": "Feb", "MAR": "Mar", "ABR": "Apr",
        "MAY": "May", "JUN": "Jun", "JUL": "Jul", "AGO": "Aug",
        "SEP": "Sep", "OCT": "Oct", "NOV": "Nov", "DIC": "Dec"
    };

    const parseDate = d3.timeParse("%Y/%m-%b");

    let datos = impacto.map((item, index) => {
        let fechaStr = item.ID_Impacto;
        let [anio, mesTexto] = fechaStr.split("/");
        let mesNombre = meses[mesTexto.split("-")[1]];
        let fechaParseable = `${anio}/${mesTexto.split("-")[0]}-${mesNombre}`;
        let fecha = parseDate(fechaParseable);

        return {
            fecha: fecha || new Date(),
            nivel_ruido: parseFloat(item.Nivel_Ruido) || 0,
            nivel_contaminacion: parseFloat(item.Nivel_Contaminacion) || 0,
            gasto_medio: parseFloat(turismo[index]?.Gasto_Medio) || 0
        };
    });

    datos = datos.filter(d => !isNaN(d.fecha)).sort((a, b) => a.fecha - b.fecha);

    crearGraficoComparacion(datos);

}).catch(error => console.error("Error cargando los datos:", error));

// Grafico de comparacion
function crearGraficoComparacion(datos) {
    const svgWidth = 800, svgHeight = 500;
    const margin = { top: 20, right: 200, bottom: 50, left: 20 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#contaminacion_gasto_lineas")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Escalas
    const x = d3.scaleTime()
        .domain(d3.extent(datos, d => d.fecha))
        .range([0, width]);

    const yLeft = d3.scaleLinear()
        .domain([0, d3.max(datos, d => Math.max(d.nivel_ruido, d.nivel_contaminacion))])
        .range([height, 0]);

    const yRight = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.gasto_medio)])
        .range([height, 0]);

    // Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(yLeft))
        .attr("stroke", "black"); 

    svg.append("g")
        .attr("transform", `translate(${width}, 0)`)
        .call(d3.axisRight(yRight))
        .attr("stroke", "black"); 

    // Líneas
    const lineRuido = d3.line()
        .x(d => x(d.fecha))
        .y(d => yLeft(d.nivel_ruido));

    svg.append("path")
        .datum(datos)
        .attr("fill", "none")
        .attr("stroke", "#F940F6")
        .attr("stroke-width", 2)
        .attr("d", lineRuido);

    const lineContaminacion = d3.line()
        .x(d => x(d.fecha))
        .y(d => yLeft(d.nivel_contaminacion));

    svg.append("path")
        .datum(datos)
        .attr("fill", "none")
        .attr("stroke", "#E7265F")
        .attr("stroke-width", 2)
        .attr("d", lineContaminacion);

    const lineGasto = d3.line()
        .x(d => x(d.fecha))
        .y(d => yRight(d.gasto_medio));

    svg.append("path")
        .datum(datos)
        .attr("fill", "none")
        .attr("stroke", "blue")
        .attr("stroke-width", 2)
        .attr("d", lineGasto);

    // Leyenda
    const legend = svg.append("g")
        .attr("transform", `translate(${width + 30}, ${height - 100})`);

    legend.append("rect").attr("width", 12).attr("height", 12).attr("fill", "#F940F6");
    legend.append("text").attr("x", 20).attr("y", 10).text("Ruido").attr("fill", "black");

    legend.append("rect").attr("y", 20).attr("width", 12).attr("height", 12).attr("fill", "#E7265F");
    legend.append("text").attr("x", 20).attr("y", 30).text("Contaminación aire").attr("fill", "black");

    legend.append("rect").attr("y", 40).attr("width", 12).attr("height", 12).attr("fill", "blue");
    legend.append("text").attr("x", 20).attr("y", 50).text("Gasto medio turista").attr("fill", "black");
}

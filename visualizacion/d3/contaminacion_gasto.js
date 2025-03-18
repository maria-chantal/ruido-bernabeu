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

    let datos = impacto.map((item, index) => {
        return {
            nivel_ruido: parseFloat(item.Nivel_Ruido) || 0,
            nivel_contaminacion: parseFloat(item.Nivel_Contaminacion) || 0,
            gasto_medio: parseFloat(turismo[index]?.Gasto_Medio) || 0
        };
    });

    console.log("Datos procesados:", datos);

    if (datos.length === 0) {
        console.error("Error: No hay datos después del procesamiento.");
        return;
    }

    crearScatterPlot(datos);
}).catch(error => console.error("Error cargando los datos:", error));


function crearScatterPlot(datos) {
    const svgWidth = 800, svgHeight = 500;
    const margin = { top: 20, right: 60, bottom: 50, left: 70 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#contaminacion_gasto")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .style("border", "1px solid black")
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Escala X (Ruido o Contaminación)
    const x = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.nivel_ruido)]) 
        .range([0, width]);

    // Escala Y (Gasto Medio)
    const y = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.gasto_medio)])
        .range([height, 0]);

    // Colores
    const color = d3.scaleOrdinal()
        .domain(["ruido", "contaminacion"])
        .range(["red", "blue"]);

    // Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Puntos (Scatter Plot)
    svg.selectAll(".dot")
        .data(datos)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.nivel_ruido))
        .attr("cy", d => y(d.gasto_medio))
        .attr("r", 5) // Tamaño del punto
        .style("fill", d => color("ruido")) // Color
        .style("opacity", 0.7);

    // Puntos de contaminación (Scatter Plot)
    svg.selectAll(".dot2")
        .data(datos)
        .enter()
        .append("circle")
        .attr("cx", d => x(d.nivel_contaminacion))
        .attr("cy", d => y(d.gasto_medio))
        .attr("r", 5)
        .style("fill", d => color("contaminacion"))
        .style("opacity", 0.7);

    // Leyenda
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, ${height - 100})`);

    legend.append("rect").attr("width", 12).attr("height", 12).attr("fill", "red");
    legend.append("text").attr("x", 20).attr("y", 10).text("Nivel de Ruido").attr("fill", "black");

    legend.append("rect").attr("y", 20).attr("width", 12).attr("height", 12).attr("fill", "blue");
    legend.append("text").attr("x", 20).attr("y", 30).text("Nivel de Contaminación").attr("fill", "black");

    console.log("Scatter plot generado.");
}

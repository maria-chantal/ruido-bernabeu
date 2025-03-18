Promise.all([
    d3.json("/datos/turismo.json")
]).then(([turismoData]) => {
    console.log("Turismo:", turismoData);

    const idsMayo = [
        "2019/05-MAY", "2020/05-MAY", "2021/05-MAY",
        "2022/05-MAY", "2023/05-MAY", "2024/05-MAY"
    ];

    let datos = idsMayo.map(id => {
        let item = turismoData.turismo.find(d => d.ID_turismo === id);
        return {
            anio: id.split("/")[0], // Extraer solo el año
            turistas: item ? +item.Turistas_Internacionales || 0 : 0
        };
    });

    console.log("Datos procesados:", datos);

    // Verifica si los datos son correctos
    if (datos.every(d => d.turistas === 0)) {
        console.error("Todos los valores de turistas son 0. Revisa el JSON.");
    }

    // Eliminar cualquier gráfico previo
    d3.select("#turistas_mayo").html("");

    crearGrafico(datos);
}).catch(error => console.error("Error cargando los datos:", error));

function crearGrafico(datos) {
    const svgWidth = 800, svgHeight = 500;
    const margin = { top: 20, right: 30, bottom: 70, left: 70 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#turistas_mayo")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleBand()
        .domain(datos.map(d => d.anio))
        .range([0, width])
        .padding(0.2);

    const y = d3.scaleLinear()
        .domain([0, d3.max(datos, d => d.turistas)])
        .nice()
        .range([height, 0]);

    // Eje X
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    // Eje Y
    svg.append("g")
        .call(d3.axisLeft(y));

    // Barras
    svg.selectAll(".bar")
        .data(datos)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.anio))
        .attr("y", d => y(d.turistas))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.turistas))
        .attr("fill", "steelblue");

    // Etiqueta de eje X
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 50)
        .attr("text-anchor", "middle")
        .text("Año");

    // Etiqueta de eje Y
    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", -50)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .text("Turistas Internacionales");
}

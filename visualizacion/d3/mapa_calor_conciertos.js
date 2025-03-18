Promise.all([
    d3.json("/datos/impacto_urbano.json")
]).then(([impactoData]) => {

    console.log("Impacto Urbano:", impactoData);

    const impacto = impactoData.impacto_urbano;

    if (impacto.length === 0) {
        console.error("Error: El dataset está vacío.");
        return;
    }

    const conciertos = {
        "2019-06": "CONES",
        "2022-06": "CONRS",
        "2023-06": "CONGNR",
        "2024-05": "CONTS",
        "2024-06": "CONDK",
        "2024-07": "CONKG"
    };

    let datos = impacto.map(item => {
        let fechaStr = item.ID_Impacto; // "YYYY/MM-MES"
        let [anio, mesTexto] = fechaStr.split("/");
        let mes = mesTexto.split("-")[0].padStart(2, "0"); // "6" → "06"
        let fecha = `${anio}-${mes}`; // "2024-06"

        return {
            fecha,
            nivel_ruido: parseFloat(item.Nivel_Ruido) || 0,
            nivel_contaminacion: parseFloat(item.Nivel_Contaminacion) || 0,
            esConcierto: conciertos[fecha] ? true : false
        };
    });

    datos = datos.filter(d => {
        let anio = parseInt(d.fecha.split("-")[0]); // Extraer el año
        return anio < 2020 || anio >= 2022; // Excluir 2020, 2021 dado que no hay conciertos

    });

    console.log("Datos procesados:", datos);

    crearHeatmap(datos);
}).catch(error => console.error("Error cargando los datos:", error));

function crearHeatmap(datos) {
    const svgWidth = 900, svgHeight = 500;
    const margin = { top: 30, right: 100, bottom: 60, left: 80 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const svg = d3.select("#mapa_calor")
        .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Escala X (Fechas: Mes/Año)
    const x = d3.scaleBand()
        .domain([...new Set(datos.map(d => d.fecha))])
        .range([0, width])
        .padding(0.1);

    // Escala Y (Impacto: Ruido o Contaminación)
    const y = d3.scaleBand()
        .domain(["Nivel de Ruido", "Nivel de Contaminación"])
        .range([height, 0])
        .padding(0.1);

    // Escala de Color (Mayor impacto → Más oscuro)
    const color = d3.scaleSequential(d3.interpolateOranges)
        .domain([0, d3.max(datos, d => Math.max(d.nivel_ruido, d.nivel_contaminacion))]);

    // Celdas de conciertos
    svg.selectAll("rect")
        .data(datos)
        .enter()
        .append("rect")
        .attr("x", d => x(d.fecha))
        .attr("y", d => y("Nivel de Ruido"))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth() / 2)
        .attr("fill", d => color(d.nivel_ruido))
        .attr("stroke", d => d.esConcierto ? "black" : "none") // Resaltar conciertos
        .attr("stroke-width", 2);

    svg.selectAll("rect.contaminacion")
        .data(datos)
        .enter()
        .append("rect")
        .attr("x", d => x(d.fecha))
        .attr("y", d => y("Nivel de Contaminación"))
        .attr("width", x.bandwidth())
        .attr("height", y.bandwidth() / 2)
        .attr("fill", d => color(d.nivel_contaminacion))
        .attr("stroke", d => d.esConcierto ? "black" : "none") // Resaltar conciertos
        .attr("stroke-width", 2);

    // Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");

    svg.append("g").call(d3.axisLeft(y));

    // Leyenda 
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 100}, ${height - 100})`);

    const gradient = legend.append("defs")
        .append("linearGradient")
        .attr("id", "legend-gradient")
        .attr("x1", "0%").attr("y1", "100%")
        .attr("x2", "0%").attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", color(0));
    gradient.append("stop").attr("offset", "100%").attr("stop-color", color(d3.max(datos, d => Math.max(d.nivel_ruido, d.nivel_contaminacion))));

    legend.append("rect")
        .attr("width", 20)
        .attr("height", 100)
        .style("fill", "url(#legend-gradient)");

    legend.append("text").attr("x", 30).attr("y", 10).text("Mayor impacto").style("font-size", "8px");
    legend.append("text").attr("x", 30).attr("y", 90).text("Menor impacto").style("font-size", "8px");

}

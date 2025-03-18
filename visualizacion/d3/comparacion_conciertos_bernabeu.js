Promise.all([
    d3.json("/datos/turismo.json"),
    d3.json("/datos/impacto_urbano.json")
]).then(([turismoData, impactoData]) => {

    const fechasConciertos = {
        "Taylor Swift": "2024/05-MAY",
        "Duki": "2024/06-JUN",
        "Karol G": "2024/07-JUL"
    };

    let datosConciertos = Object.entries(fechasConciertos).map(([concierto, fecha]) => {
        let turismo = turismoData.turismo.find(d => d.ID_turismo === fecha) || {};
        let impacto = impactoData.impacto_urbano.find(d => d.ID_Impacto === fecha) || {};

        return {
            nombre: concierto,
            turistas: turismo.Turistas_Internacionales ? +turismo.Turistas_Internacionales : 0,
            ruido: impacto.Nivel_Ruido ? +impacto.Nivel_Ruido : 0,
            contaminacion: impacto.Nivel_Contaminacion ? +impacto.Nivel_Contaminacion : 0
        };
    });

    let maxTuristas = d3.max(datosConciertos, d => d.turistas) || 1;
    let maxRuido = d3.max(datosConciertos, d => d.ruido) || 1;
    let maxContaminacion = d3.max(datosConciertos, d => d.contaminacion) || 1;

    // Evitar que max sea 0 
    maxTuristas = maxTuristas > 0 ? maxTuristas : 1;
    maxRuido = maxRuido > 0 ? maxRuido : 1;
    maxContaminacion = maxContaminacion > 0 ? maxContaminacion : 1;

    datosConciertos.forEach(d => {
        d.turistas = (d.turistas / maxTuristas) * 100;
        d.ruido = (d.ruido / maxRuido) * 100;
        d.contaminacion = (d.contaminacion / maxContaminacion) * 100;
    });

    // Configuración del SVG
    const margin = { top: 40, right: 80, bottom: 50, left: 70 };
    const width = 700 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#comparacion_bernabeu")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Escalas
    const x0 = d3.scaleBand()
        .domain(datosConciertos.map(d => d.nombre))
        .range([0, width])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(["turistas", "ruido", "contaminacion"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, 100]) // Normalización de 0 a 100
        .range([height, 0]);

    // Colores 
    const colores = {
        turistas: "steelblue",
        ruido: "#F940F6",
        contaminacion: "#E7265F"
    };

    // Ejes
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x0));

    svg.append("g")
        .call(d3.axisLeft(y));

    // Dibujar las barras
    svg.selectAll("g.barra")
        .data(datosConciertos)
        .enter()
        .append("g")
        .attr("class", "barra")
        .attr("transform", d => `translate(${x0(d.nombre)}, 0)`)
        .selectAll("rect")
        .data(d => Object.keys(colores).map(key => ({ key: key, value: d[key] })))
        .enter()
        .append("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => colores[d.key]);

    // Leyenda
    let legend = svg.append("g")
        .attr("transform", `translate(${width - 10}, ${height - 80})`);

    Object.entries(colores).forEach(([key, color], i) => {
        legend.append("rect")
            .attr("x", 0)
            .attr("y", i * 20)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", color);

        legend.append("text")
            .attr("x", 20)
            .attr("y", i * 20 + 10)
            .text(key.charAt(0).toUpperCase() + key.slice(1))
            .attr("fill", "black");
    });

}).catch(error => console.error("Error cargando los datos:", error));

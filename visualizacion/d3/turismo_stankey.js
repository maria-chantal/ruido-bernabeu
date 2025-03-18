const data = {
  nodes: [
    { name: "Turistas_Internacionales" },
    { name: "Turistas" },
    { name: "Reservas de hotel" },
    { name: "Pernotación de hoteles" },
    { name: "Reservas de apartamentos" },
    { name: "Pernoctación de apartamentos" },
  ],
  links: [],
};

const conciertos = [
  { nombre: "Taylor Swift", fecha: "2024/05-MAY" },
  { nombre: "Duki", fecha: "2024/06-JUN" },
  { nombre: "Karol G", fecha: "2024/07-JUL" },
  { nombre: "Ed Sheeran", fecha: "2019/06-JUN" },
  { nombre: "Rolling Stones", fecha: "2022/06-JUN" },
  { nombre: "Guns N Roses", fecha: "2023/06-JUN" },
];

fetch("/datos/turismo.json")
  .then((response) => response.json())
  .then((json) => {
    const turismoData = json.turismo.filter((entry) =>
      conciertos.some((c) => c.fecha === entry.ID_turismo)
    );

    let turistas = 0;
    let reservasHotel = 0;
    let pernoctacionesHotel = 0;
    let reservasApartamentos = 0;
    let pernoctacionesApartamentos = 0;

    turismoData.forEach((entry) => {
      turistas += entry.Turistas_Internacionales || 0;
      reservasHotel += entry.Reservas_Hoteles || 0;
      pernoctacionesHotel += entry.Pernotación_Hoteles || 0;
      reservasApartamentos += entry.Apartamentos || 0;
      pernoctacionesApartamentos += entry.Pernoctación_Apartamentos || 0;
    });
    const totalSubdivisiones =
      reservasHotel +
      pernoctacionesHotel +
      reservasApartamentos +
      pernoctacionesApartamentos;

    const factorAjuste =
      totalSubdivisiones > 0 ? turistas / totalSubdivisiones : 1;

    data.links = [
      { source: 0, target: 1, value: turistas || 1 },
      { source: 1, target: 2, value: reservasHotel * factorAjuste || 1 },
      { source: 1, target: 3, value: pernoctacionesHotel * factorAjuste || 1 },
      { source: 1, target: 4, value: reservasApartamentos * factorAjuste || 1 },
      {
        source: 1,
        target: 5,
        value: pernoctacionesApartamentos * factorAjuste || 1,
      },
    ];

    drawSankey(data);
  });

function drawSankey(data) {
  const width = 700;
  const height = 500;

  const svg = d3
    .select("#turismo_stankey")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const sankey = d3
    .sankey()
    .nodeWidth(20)
    .nodePadding(20)
    .size([width, height]);

  const graph = sankey({
    nodes: data.nodes.map((d) => Object.assign({}, d)),
    links: data.links.map((d) => Object.assign({}, d)),
  });

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  const link = svg
    .append("g")
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", d3.sankeyLinkHorizontal())
    .attr("fill", "none")
    .attr("stroke", (d) => color(d.source.name))
    .attr("stroke-opacity", 0.7)
    .attr("stroke-width", (d) => Math.max(1, d.width));

  const node = svg
    .append("g")
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("g")
    .attr("class", "node");

  node
    .append("rect")
    .attr("x", (d) => d.x0)
    .attr("y", (d) => d.y0)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => Math.max(10, d.y1 - d.y0))
    .attr("fill", (d, i) => color(i));

  node
    .append("text")
    .attr("x", (d) => d.x0 - 6)
    .attr("y", (d) => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .style("fill", "black")
    .text((d) => d.name);
}

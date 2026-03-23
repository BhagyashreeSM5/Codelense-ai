import { useEffect, useRef } from "react";
import * as d3 from "d3";

function GraphViewer({ nodes, edges, fileMap, onNodeClick }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    // 🧠 Clear previous graph before drawing new one
    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // 🧠 WHY force simulation?
    // D3 force layout automatically positions nodes
    // like a physics simulation — nodes repel each other,
    // edges pull connected nodes together
    const simulation = d3.forceSimulation()
      .force("link", d3.forceLink()
        .id((d) => d.id)
        .distance(120) // edge length
      )
      .force("charge", d3.forceManyBody().strength(-400)) // repulsion
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(50));

    const svg = d3.select(svgRef.current);

    // 🧠 WHY add zoom?
    // Large codebases have many nodes — user needs to zoom & pan
    const g = svg.append("g");
    svg.call(
      d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => g.attr("transform", event.transform))
    );

    // Build node and edge data
    const nodeData = nodes.map((n) => ({
      id: n,
      file: fileMap[n]?.file || "unknown",
      language: fileMap[n]?.language || "unknown",
    }));

    const linkData = edges.map((e) => ({
      source: e.from,
      target: e.to,
    }));

    // Count how many times each function is called
    // 🧠 This gives us the HEATMAP data!
    const callCount = {};
    edges.forEach((e) => {
      callCount[e.to] = (callCount[e.to] || 0) + 1;
    });
    const maxCalls = Math.max(...Object.values(callCount), 1);

    // 🧠 Color scale for heatmap
    // Green = rarely called, Red = most called (most depended on)
    const colorScale = d3.scaleLinear()
      .domain([0, maxCalls])
      .range(["#4CAF50", "#ff4444"]);

    // Draw edges (arrows between nodes)
    // 🧠 We add arrowhead markers using SVG defs
    svg.append("defs").selectAll("marker")
      .data(["arrow"])
      .enter().append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 28)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#764ba2");

    const link = g.append("g")
      .selectAll("line")
      .data(linkData)
      .enter().append("line")
      .attr("stroke", "#764ba2")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", 1.5)
      .attr("marker-end", "url(#arrow)");

    // Draw nodes (circles for each function)
    const node = g.append("g")
      .selectAll("g")
      .data(nodeData)
      .enter().append("g")
      .attr("cursor", "pointer")
      .call(
        // 🧠 WHY drag?
        // User can drag nodes to rearrange the graph
        d3.drag()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on("click", (event, d) => {
        // 🧠 When node is clicked, tell parent component
        if (onNodeClick) onNodeClick(d);
      });

    // Circle for each node — color = heatmap
    node.append("circle")
      .attr("r", (d) => 20 + (callCount[d.id] || 0) * 3)
      .attr("fill", (d) => colorScale(callCount[d.id] || 0))
      .attr("fill-opacity", 0.85)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5);

    // Function name label
    node.append("text")
      .text((d) => d.id.length > 12 ? d.id.slice(0, 12) + "..." : d.id)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("fill", "#fff")
      .attr("font-weight", "500");

    // 🧠 Tooltip on hover — show full function name + file
    node.append("title")
      .text((d) => `${d.id}\nFile: ${d.file}\nCalled: ${callCount[d.id] || 0} times`);

    // Run the force simulation
    simulation.nodes(nodeData).on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    simulation.force("link").links(linkData);

  }, [nodes, edges, fileMap]);

  return (
    <svg
      ref={svgRef}
      style={{
        width: "100%",
        height: "100%",
        background: "#0f0f1a",
        borderRadius: "12px",
      }}
    />
  );
}

export default GraphViewer;
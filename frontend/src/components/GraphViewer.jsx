import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

function Graph({ nodes, edges, fileMap }) {
  const svgRef = useRef(null);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (!nodes || nodes.length === 0) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = svgRef.current.clientWidth || 900;
    const height = svgRef.current.clientHeight || 600;

    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const g = svg.append("g");

    // Zoom
    svg.call(d3.zoom()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => g.attr("transform", event.transform))
    );

    // 🧠 Build proper node and link objects
    // D3 force simulation needs objects with id property
    const nodeData = nodes.map(n => ({ id: n }));

    // 🧠 KEY FIX: edges must reference node objects by id string
    // filter out edges where source or target doesn't exist in nodes
    const linkData = edges
      .filter(e => nodes.includes(e.from) && nodes.includes(e.to))
      .map(e => ({ source: e.from, target: e.to }));

    // Count how many times each node is called (in-degree)
    const callCount = {};
    nodes.forEach(n => callCount[n] = 0);
    edges.forEach(e => {
      if (callCount[e.to] !== undefined) callCount[e.to]++;
    });
    const maxCalls = Math.max(...Object.values(callCount), 1);

    // Color scale: green → yellow → red
    const colorScale = d3.scaleLinear()
      .domain([0, maxCalls / 2, maxCalls])
      .range(["#4CAF50", "#FFC107", "#F44336"]);

    // 🧠 Arrowhead marker
    svg.append("defs").append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "-0 -5 10 10")
      .attr("refX", 30)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .append("path")
      .attr("d", "M 0,-5 L 10,0 L 0,5")
      .attr("fill", "#888")
      .style("stroke", "none");

    // Draw edges FIRST (so they appear behind nodes)
    const link = g.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(linkData)
      .enter()
      .append("line")
      .attr("stroke", "#555")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)
      .attr("marker-end", "url(#arrowhead)");

    // Draw nodes
    const nodeGroup = g.append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(nodeData)
      .enter()
      .append("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on("drag", (event, d) => {
          d.fx = event.x; d.fy = event.y;
        })
        .on("end", (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = null; d.fy = null;
        })
      )
      .on("click", (event, d) => {
        event.stopPropagation();
        setSelectedNode(prev => prev === d.id ? null : d.id);

        // 🧠 Highlight connected edges on click
        link
          .attr("stroke", l =>
            l.source.id === d.id || l.target.id === d.id
              ? "#a78bfa" : "#555"
          )
          .attr("stroke-width", l =>
            l.source.id === d.id || l.target.id === d.id ? 3 : 1.5
          )
          .attr("stroke-opacity", l =>
            l.source.id === d.id || l.target.id === d.id ? 1 : 0.2
          );

        // Dim unconnected nodes
        nodeGroup.select("circle")
          .attr("opacity", n => {
            const connected = edges.some(
              e => (e.from === d.id && e.to === n.id) ||
                   (e.to === d.id && e.from === n.id) ||
                   n.id === d.id
            );
            return connected ? 1 : 0.3;
          });
      });

    // Click on background → reset highlights
    svg.on("click", () => {
      setSelectedNode(null);
      link.attr("stroke", "#555").attr("stroke-width", 1.5).attr("stroke-opacity", 0.6);
      nodeGroup.select("circle").attr("opacity", 1);
    });

    // Circle for each node
    nodeGroup.append("circle")
      .attr("r", d => 18 + (callCount[d.id] || 0) * 5)
      .attr("fill", d => colorScale(callCount[d.id] || 0))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Label for each node
    nodeGroup.append("text")
      .text(d => d.id.length > 10 ? d.id.slice(0, 10) + "..." : d.id)
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .attr("font-size", "11px")
      .attr("fill", "white")
      .attr("font-weight", "600")
      .attr("pointer-events", "none");

    // 🧠 Force simulation
    const simulation = d3.forceSimulation(nodeData)
      .force("link", d3.forceLink(linkData)
        .id(d => d.id)
        .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(55));

    // Update positions every tick
    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

      nodeGroup.attr("transform", d => `translate(${d.x},${d.y})`);
    });

  }, [nodes, edges]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>

      {/* Legend */}
      <div style={{
        position: "absolute", top: "12px", left: "12px",
        background: "rgba(30,30,40,0.95)", borderRadius: "10px",
        padding: "10px 14px", fontSize: "12px", zIndex: 10,
        border: "1px solid #444", color: "white"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "8px", color: "#a78bfa" }}>
          🔥 Dependency Heatmap
        </div>
        {[
          { color: "#4CAF50", label: "Rarely called" },
          { color: "#FFC107", label: "Moderately called" },
          { color: "#F44336", label: "Heavily called (critical!)" },
        ].map(item => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color }} />
            <span style={{ color: "#ccc" }}>{item.label}</span>
          </div>
        ))}
        <div style={{ marginTop: "8px", color: "#888", fontSize: "11px" }}>
          Click node to highlight connections
        </div>
      </div>

      {/* Selected node info */}
      {selectedNode && (
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          background: "rgba(30,30,40,0.95)", borderRadius: "10px",
          padding: "12px 16px", fontSize: "13px", zIndex: 10,
          border: "1px solid #a78bfa", color: "white", maxWidth: "200px"
        }}>
          <div style={{ fontWeight: "600", marginBottom: "6px", color: "#a78bfa" }}>
            📌 {selectedNode}
          </div>
          {fileMap[selectedNode] && (
            <>
              <div style={{ color: "#aaa", fontSize: "12px" }}>
                📄 {fileMap[selectedNode].file}
              </div>
              <div style={{ color: "#a78bfa", fontSize: "12px", marginTop: "2px" }}>
                🔤 {fileMap[selectedNode].language}
              </div>
            </>
          )}
          {/* Show connected functions */}
          <div style={{ marginTop: "8px", fontSize: "12px" }}>
            <div style={{ color: "#888", marginBottom: "4px" }}>Calls:</div>
            {edges.filter(e => e.from === selectedNode).map(e => (
              <div key={e.to} style={{ color: "#4CAF50" }}>→ {e.to}</div>
            ))}
            <div style={{ color: "#888", marginBottom: "4px", marginTop: "4px" }}>Called by:</div>
            {edges.filter(e => e.to === selectedNode).map(e => (
              <div key={e.from} style={{ color: "#FFC107" }}>← {e.from}</div>
            ))}
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            style={{
              marginTop: "8px", fontSize: "11px", color: "#888",
              background: "none", border: "none", cursor: "pointer"
            }}
          >✕ Close</button>
        </div>
      )}

      <svg
        ref={svgRef}
        style={{
          width: "100%", height: "100%",
          background: "#1a1a2e", borderRadius: "12px"
        }}
      />
    </div>
  );
}

export default Graph;
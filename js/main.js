/* main.js
   ----------
   Orchestrates the app:
   - D3 rendering & auto-center
   - Node dragging
   - Context menu actions
   - Toolbar (Add, Export, Import)
   - Initialization (initApp)
*/

document.addEventListener("DOMContentLoaded", initApp);

let zoom; // D3 zoom behavior
let currentContextMember = null; // also stored in window.currentContextMember

function initApp() {
  setupUI();
  setupZoom();
  adjustTreeContainer();
  render(); // Initial render

  // Add analytics button handler
  document.querySelector('.toolbar button:contains("Analytics")').onclick = () => {
    showAnalyticsModal();
  };

  window.addEventListener("resize", () => {
    adjustTreeContainer();
    render();
  });
}

/** Adjust the tree container to fill the browser */
function adjustTreeContainer() {
  const treeContainer = document.getElementById("tree-container");
  const header = document.querySelector("header");
  const toolbar = document.querySelector(".toolbar");
  const totalHeaderHeight = header.offsetHeight + toolbar.offsetHeight;
  
  treeContainer.style.height = `${window.innerHeight - totalHeaderHeight}px`;
  
  // Force SVG to match container size
  const svg = document.getElementById("tree-svg");
  svg.setAttribute("width", treeContainer.offsetWidth);
  svg.setAttribute("height", treeContainer.offsetHeight);
}

/* ---------- Rendering with D3 ---------- */
function render() {
  const svg = d3.select("#tree-svg");
  svg.selectAll("*").remove();

  const linesGroup = svg.append("g").attr("id", "lines-group");
  const nodesGroup = svg.append("g").attr("id", "nodes-group");

  // Draw lines first
  relationships.forEach((rel) => {
    const fromM = familyMembers.find((m) => m.id === rel.from);
    const toM = familyMembers.find((m) => m.id === rel.to);
    if (!fromM || !toM) return;
    linesGroup
      .append("line")
      .attr("x1", fromM.x)
      .attr("y1", fromM.y)
      .attr("x2", toM.x)
      .attr("y2", toM.y)
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", rel.type === "spouse" ? "4,2" : null);
  });

  // Draw nodes
  const nodes = nodesGroup.selectAll(".person-node")
    .data(familyMembers, d => d.id);

  // Remove old nodes
  nodes.exit().remove();

  // Create new nodes
  const nodeEnter = nodes.enter()
    .append("g")
    .attr("class", d => `person-node ${d.gender || ''}`)
    .attr("transform", d => `translate(${d.x},${d.y})`);

  // Add circle (bottom layer)
  nodeEnter.append("circle")
    .attr("r", 30)
    .attr("fill", d => d.gender === "female" ? "#e84393" : "#3498db");

  // Add white background with border (middle layer)
  nodeEnter.append("rect")
    .attr("x", -60)
    .attr("y", 35)
    .attr("width", 120)
    .attr("height", 30)
    .attr("fill", "white")
    .attr("stroke", "#2980b9")
    .attr("stroke-width", 2)
    .attr("rx", 4);

  // Add name text (top layer)
  const nameLabels = nodeEnter.append("text")
    .attr("x", 0)
    .attr("y", 50)  // Adjusted to be vertically centered
    .attr("dominant-baseline", "middle")  // Add this for vertical centering
    .attr("text-anchor", "middle")
    .attr("fill", "#2c3e50")
    .attr("font-weight", "bold");

  // Handle text wrapping for names
  nameLabels.each(function(d) {
    const text = d3.select(this);
    const words = d.name.split(' ');
    
    if (words.length > 1) {
      // Split on last name
      const lastName = words.pop();
      const firstNames = words.join(' ');
      
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "-0.5em")  // Adjusted spacing
        .text(firstNames);
      
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", "1.2em")
        .text(lastName);
    } else {
      // Single word name - centered vertically
      text.text(d.name);
    }
  });

  // Update existing nodes
  nodes.attr("transform", d => `translate(${d.x},${d.y})`);

  // Add drag behavior
  nodeEnter.call(d3.drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded)
  );

  // Add right-click behavior
  nodeEnter.on("contextmenu", (event, d) => {
    event.preventDefault();
    event.stopPropagation();
    showContextMenu(event, d);
  });

  // Center the view
  centerNodes();
}

// Text wrapping function
function wrapText(text, width) {
  text.each(function() {
    const text = d3.select(this);
    const words = text.text().split(/\s+/);
    const lines = [];
    let line = [];
    
    words.forEach(word => {
      line.push(word);
      if (line.join(' ').length > 10) {
        lines.push(line.join(' '));
        line = [];
      }
    });
    if (line.length) lines.push(line.join(' '));
    
    text.text(null);
    lines.forEach((line, i) => {
      text.append("tspan")
        .attr("x", 0)
        .attr("dy", i ? "1.1em" : 0)
        .text(line);
    });
  });
}

// Generate timeline view
function renderTimeline() {
  const timelineContent = document.querySelector(".timeline-content");
  timelineContent.innerHTML = "";

  // Create timeline scale
  const dates = familyMembers
    .map(m => new Date(m.birth))
    .filter(d => !isNaN(d.getTime()));

  if (dates.length === 0) return;

  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  const timeScale = d3.scaleTime()
    .domain([minDate, maxDate])
    .range([50, window.innerWidth - 50]);

  // Add timeline items
  familyMembers.forEach(member => {
    if (!member.birth) return;
    
    const birthDate = new Date(member.birth);
    const item = document.createElement("div");
    item.className = "timeline-item";
    item.style.left = `${timeScale(birthDate)}px`;
    item.innerHTML = `
      <strong>${member.name}</strong><br>
      ${member.birth}${member.death ? ` - ${member.death}` : ''}
    `;
    
    item.onclick = () => {
      window.currentContextMember = member;
      showInfoModal(member);
    };
    
    timelineContent.appendChild(item);
  });
}

// Quick navigation to relatives
function setupQuickNav() {
  const nav = d3.select(".quick-nav");
  
  nav.selectAll("button")
    .data([
      { icon: "👆", action: "parents" },
      { icon: "👇", action: "children" },
      { icon: "👫", action: "siblings" },
      { icon: "💑", action: "spouse" }
    ])
    .enter()
    .append("button")
    .html(d => d.icon)
    .on("click", (e, d) => navigateToRelatives(d.action));
}

function navigateToRelatives(type) {
  if (!window.currentContextMember) return;
  
  const member = window.currentContextMember;
  const relatives = findRelatives(member, type);
  
  if (relatives.length) {
    highlightNodes(relatives);
    centerOnNodes(relatives);
  }
}

// Auto-arrange layout
function autoArrangeLayout() {
  const generations = groupByGeneration();
  const levelHeight = 150;
  
  generations.forEach((members, level) => {
    const levelWidth = window.innerWidth / (members.length + 1);
    members.forEach((member, i) => {
      member.x = levelWidth * (i + 1);
      member.y = level * levelHeight + 100;
    });
  });
  
  saveData();
  render();
}

/* ---------- Zoom & Pan ---------- */
function setupZoom() {
  const svg = d3.select("#tree-svg").attr("width", "100%").attr("height", "100%");
  zoom = d3
    .zoom()
    .scaleExtent([0.1, 3]) // Change from default [0.5, 2] to allow more zoom out
    .on("zoom", (event) => {
      svg.select("#lines-group").attr("transform", event.transform);
      svg.select("#nodes-group").attr("transform", event.transform);
    });
  svg.call(zoom);
}

/* Auto-center nodes by bounding box */
function centerNodes() {
  if (!familyMembers.length) return;
  const container = document.getElementById("tree-container");
  const width = container.clientWidth;
  const height = container.clientHeight;

  const minX = d3.min(familyMembers, (d) => d.x);
  const maxX = d3.max(familyMembers, (d) => d.x);
  const minY = d3.min(familyMembers, (d) => d.y);
  const maxY = d3.max(familyMembers, (d) => d.y);

  const nodesWidth = maxX - minX;
  const nodesHeight = maxY - minY;
  const margin = 100;
  const scale = Math.min(
    width / (nodesWidth + margin),
    height / (nodesHeight + margin)
  );
  const finalScale = isFinite(scale) && scale > 0 ? scale : 1;
  const offsetX = (width - nodesWidth * finalScale) / 2;
  const offsetY = (height - nodesHeight * finalScale) / 2;

  const transform = d3.zoomIdentity
    .translate(offsetX - minX * finalScale, offsetY - minY * finalScale)
    .scale(finalScale);

  d3.select("#tree-svg").call(zoom.transform, transform);
}

/* ---------- Dragging Nodes ---------- */
function dragStarted(event, d) {
  d3.select(this).raise().classed("active", true);
}

function dragged(event, d) {
  d.x = event.x;
  d.y = event.y;
  d3.select(this).attr("transform", `translate(${d.x},${d.y})`);
  updateLines();
}

function dragEnded(event, d) {
  d3.select(this).classed("active", false);
  saveData();
  updateLines();
}

function updateLines() {
  const linesGroup = d3.select("#lines-group");
  linesGroup.selectAll("*").remove();

  relationships.forEach((rel) => {
    const fromM = familyMembers.find((m) => m.id === rel.from);
    const toM = familyMembers.find((m) => m.id === rel.to);
    if (!fromM || !toM) return;
    linesGroup
      .append("line")
      .attr("x1", fromM.x)
      .attr("y1", fromM.y)
      .attr("x2", toM.x)
      .attr("y2", toM.y)
      .attr("stroke", "#999")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", rel.type === "spouse" ? "4,2" : null);
  });
}

/* ---------- Toolbar & UI ---------- */
function setupUI() {
  // Add Member
  document.getElementById("add-member-btn").onclick = () => {
    showEditModal(null);
  };
  // Export
  document.getElementById("export-btn").onclick = exportData;
  // Import
  document.getElementById("import-file").onchange = importData;
  // Search
  document.getElementById("search-input").addEventListener("input", function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const nodes = d3.selectAll(".person-node");
    
    nodes.style("opacity", d => 
      d.name.toLowerCase().includes(searchTerm) ? 1 : 0.3
    );
  });

  // Add Analytics tab
  const analyticsBtn = document.createElement("button");
  analyticsBtn.textContent = "Analytics";
  analyticsBtn.onclick = showAnalyticsModal;
  document.querySelector(".toolbar").appendChild(analyticsBtn);

  // Add Timeline toggle
  const timelineBtn = document.createElement("button");
  timelineBtn.textContent = "Timeline";
  timelineBtn.onclick = toggleTimeline;
  document.querySelector(".toolbar").appendChild(timelineBtn);

  // Add Reset button handler
  document.getElementById("reset-btn").onclick = () => {
    if (confirm("Are you sure you want to reset the family tree? This will remove all members and cannot be undone.")) {
      familyMembers = [];
      relationships = [];
      saveData();
      render();
    }
  };

  // Close modals
  document.getElementById("info-close").onclick = () => closeModal("info-modal");
  document.getElementById("edit-close").onclick = () => closeModal("edit-modal");
  document.getElementById("rel-close").onclick = () => closeModal("rel-modal");
  document.getElementById("manage-rel-close").onclick = () =>
    closeModal("manage-rel-modal");

  // Hide context menu if clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#context-menu")) hideContextMenu();
  });
  // Hide context menu if right-click outside a node
  document
    .getElementById("tree-container")
    .addEventListener("contextmenu", (e) => {
      if (!e.target.closest(".person-node")) hideContextMenu();
    });

  setupContextMenuActions();
}

function setupContextMenuActions() {
  document.getElementById("ctx-view-info").onclick = () => {
    hideContextMenu();
    if (window.currentContextMember) showInfoModal(window.currentContextMember);
  };
  document.getElementById("ctx-edit-member").onclick = () => {
    hideContextMenu();
    if (window.currentContextMember) showEditModal(window.currentContextMember);
  };
  document.getElementById("ctx-add-relationship").onclick = () => {
    hideContextMenu();
    if (window.currentContextMember) {
      showRelationshipModal(window.currentContextMember);
    }
  };
  document.getElementById("ctx-manage-relationships").onclick = () => {
    hideContextMenu();
    if (window.currentContextMember) {
      showManageRelationshipsModal(window.currentContextMember);
    }
  };
  document.getElementById("ctx-delete-member").onclick = () => {
    hideContextMenu();
    if (window.currentContextMember && confirm("Delete this member?")) {
      familyMembers = familyMembers.filter(
        (m) => m.id !== window.currentContextMember.id
      );
      relationships = relationships.filter(
        (r) =>
          r.from !== window.currentContextMember.id &&
          r.to !== window.currentContextMember.id
      );
      saveData();
      render();
    }
  };
}

function getAnalytics() {
  const ages = [];
  const lifespans = [];
  const birthPlaces = {};

  const living = familyMembers.filter(m => !m.death);
  const deceased = familyMembers.filter(m => m.birth && m.death);

  // Calculate average age and lifespans
  living.forEach(m => {
    const age = calculateAge(m.birth);
    if (typeof age === 'number') ages.push(age);
  });

  deceased.forEach(m => {
    const lifespan = calculateAge(m.birth, m.death);
    if (typeof lifespan === 'number') lifespans.push(lifespan);
  });

  // Count birth places
  familyMembers.forEach(m => {
    if (m.birthPlace) {
      birthPlaces[m.birthPlace] = (birthPlaces[m.birthPlace] || 0) + 1;
    }
  });

  return {
    totalMembers: familyMembers.length,
    livingMembers: living.length,
    averageAge: ages.length ? Math.round(ages.reduce((a, b) => a + b) / ages.length) : 0,
    generations: calculateGenerations(),
    genderDistribution: calculateGenderDistribution(),
    oldestMember: findOldestMember(),
    youngestMember: findYoungestMember(),
    commonBirthPlaces: birthPlaces,
    averageLifespan: lifespans.length ? Math.round(lifespans.reduce((a, b) => a + b) / lifespans.length) : 0,
    familyLongevity: calculateFamilyLongevity()
  };
}

/* ---------- Import/Export ---------- */
function exportData() {
  const data = { familyMembers, relationships };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "family_tree.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      familyMembers = obj.familyMembers || [];
      relationships = obj.relationships || [];
      saveData();
      // If you want zero popups, remove alerts
      // alert("Imported successfully!");
      render();
    } catch (err) {
      // alert("Invalid JSON file");
      // For no popups, just ignore or console.error
      console.error("Invalid JSON file:", err);
    }
  };
  reader.readAsText(file);
}

function toggleTimeline() {
  const timeline = document.querySelector(".timeline-panel");
  timeline.classList.toggle("visible");
  if (timeline.classList.contains("visible")) {
    renderTimeline();
  }
}

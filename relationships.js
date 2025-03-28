// relationships.js

function initRelationshipDrawing() {
  const svg = d3.select("#tree-svg");
  let sourceNode = null;

  // On mousedown, record the source node
  svg.selectAll('circle')
    .on('mousedown.relationship', (event, d) => {
      if (event.button !== 0) return; // left click only
      sourceNode = d.data.id;
    })
    .on('mouseup.relationship', (event, d) => {
      if (!sourceNode) return;
      const targetNode = d.data.id;
      if (targetNode !== sourceNode) {
        openRelModal(sourceNode, targetNode);
      }
      sourceNode = null;
    });
}

function openRelModal(fromId, toId) {
  const personA = familyMembers.find(m => m.id === fromId);
  const personB = familyMembers.find(m => m.id === toId);

  const relModal = document.getElementById('rel-modal');
  relModal.classList.remove('hidden');
  const relSelected = document.getElementById('rel-selected');
  relSelected.textContent = `${personA.name} → ${personB.name}`;

  document.getElementById('rel-save-btn').onclick = () => {
    const type = document.getElementById('rel-type').value;
    // Remove existing relationship if it duplicates
    relationships = relationships.filter(r => !(
      (r.from === fromId && r.to === toId) ||
      (r.from === toId && r.to === fromId)
    ));
    // Add new
    relationships.push({ from: fromId, to: toId, type });
    saveData();
    relModal.classList.add('hidden');
    renderTree();
  };
  document.getElementById('rel-close').onclick = () => {
    relModal.classList.add('hidden');
  };
}

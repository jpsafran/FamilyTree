// utils.js

function generateId() {
  return familyMembers.length
    ? Math.max(...familyMembers.map(m => m.id)) + 1
    : 1;
}

function calculateAge(birth, death) {
  if (!birth) return 'N/A';
  const b = new Date(birth);
  if (death) {
    const d = new Date(death);
    return (d.getFullYear() - b.getFullYear()) + ' (at death)';
  }
  return new Date().getFullYear() - b.getFullYear();
}

function getAnalytics() {
  const total = familyMembers.length;
  const living = familyMembers.filter(m => !m.death).length;
  const deceased = total - living;

  let sumAge = 0, count = 0;
  familyMembers.forEach(m => {
    if (!m.death && m.birth) {
      const age = new Date().getFullYear() - new Date(m.birth).getFullYear();
      sumAge += age;
      count++;
    }
  });
  const avgAge = count ? (sumAge / count).toFixed(1) : 'N/A';

  return { total, living, deceased, avgAge };
}

// Export data to JSON file
function exportData() {
  const data = { familyMembers, relationships };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'family_tree.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Import data from JSON
function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = evt => {
    try {
      const obj = JSON.parse(evt.target.result);
      familyMembers = obj.familyMembers || [];
      relationships = obj.relationships || [];
      saveData();
      alert('Imported successfully!');
      renderTree();
    } catch (err) {
      alert('Invalid JSON');
    }
  };
  reader.readAsText(file);
}

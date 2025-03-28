// data.js

let familyMembers = JSON.parse(localStorage.getItem('familyMembers') || '[]');
let relationships = JSON.parse(localStorage.getItem('relationships') || '[]');

// Each member includes: { id, name, birth, death, details, image, x, y }

function saveData() {
  localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  localStorage.setItem('relationships', JSON.stringify(relationships));
}

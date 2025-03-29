/* data.js
   ----------
   Manages loading/saving family data to localStorage,
   plus some helper functions (ID generation, age calculation).
*/

let familyMembers = [];
let relationships = [];

// Attempt to load from localStorage
try {
  familyMembers = JSON.parse(localStorage.getItem("familyMembers")) || [];
  relationships = JSON.parse(localStorage.getItem("relationships")) || [];
} catch (e) {
  familyMembers = [];
  relationships = [];
}

// If empty, add two dummy members
if (!familyMembers.length) {
  familyMembers.push({
    id: 1,
    name: "Alice",
    birth: "1970-01-01",
    death: "",
    details: "Enjoys gardening",
    image: "",
    x: window.innerWidth / 3,  // More centered positioning
    y: window.innerHeight / 3,
    gender: "female"
  });
  familyMembers.push({
    id: 2,
    name: "Bob",
    birth: "1965-05-05",
    death: "",
    details: "Likes fishing",
    image: "",
    x: (window.innerWidth / 3) * 2, // More centered positioning
    y: window.innerHeight / 3,
    gender: "male"
  });
  saveData();
}

/** Save to localStorage */
function saveData() {
  localStorage.setItem("familyMembers", JSON.stringify(familyMembers));
  localStorage.setItem("relationships", JSON.stringify(relationships));
}

/** Generate a new unique ID */
function generateId() {
  return familyMembers.length
    ? Math.max(...familyMembers.map((m) => m.id)) + 1
    : 1;
}

/** Calculate age or "N/A" */
function calculateAge(birth, death) {
    if (!birth) return "N/A";
    
    const birthDate = new Date(birth);
    const endDate = death ? new Date(death) : new Date();
    
    // Get difference in years
    let age = endDate.getFullYear() - birthDate.getFullYear();
    
    // Check if birthday hasn't occurred this year
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return death ? `${age} (at death)` : age;
}

function calculateAverageAge() {
    const livingMembers = familyMembers.filter(m => m.birth && !m.death);
    if (!livingMembers.length) return 0;
    
    const ages = livingMembers.map(m => {
        const birth = new Date(m.birth);
        return new Date().getFullYear() - birth.getFullYear();
    });
    
    return Math.round(ages.reduce((a, b) => a + b, 0) / ages.length);
}

function calculateGenerations() {
    const generations = new Set();
    
    function findGeneration(memberId, gen = 0) {
        generations.add(gen);
        const children = relationships
            .filter(r => r.from === memberId && r.type === 'parent')
            .map(r => r.to);
            
        children.forEach(childId => findGeneration(childId, gen + 1));
    }
    
    // Find root members (those without parents)
    const rootMembers = familyMembers.filter(m => 
        !relationships.some(r => r.to === m.id && r.type === 'parent')
    );
    
    rootMembers.forEach(m => findGeneration(m.id));
    return generations.size;
}

function countRelationshipTypes() {
    return relationships.reduce((acc, rel) => {
        acc[rel.type] = (acc[rel.type] || 0) + 1;
        return acc;
    }, {});
}

function groupBirthsByDecade() {
    return familyMembers
        .filter(m => m.birth)
        .reduce((acc, m) => {
            const decade = Math.floor(new Date(m.birth).getFullYear() / 10) * 10;
            acc[decade + 's'] = (acc[decade + 's'] || 0) + 1;
            return acc;
        }, {});
}

function calculateSiblingStats() {
  const siblingGroups = new Map();
  
  relationships
    .filter(r => r.type === 'parent')
    .forEach(r => {
      const siblings = relationships
        .filter(r2 => r2.type === 'parent' && r2.from === r.from)
        .map(r2 => r2.to);
      
      siblings.forEach(s => siblingGroups.set(s, siblings.length));
    });
  
  const sizes = Array.from(siblingGroups.values());
  return {
    averageSiblings: sizes.length ? 
      (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(1) : 0,
    maxSiblings: sizes.length ? Math.max(...sizes) : 0
  };
}

function getAnalytics() {
  return {
    totalMembers: familyMembers.length,
    averageAge: calculateAverageAge(),
    generations: calculateGenerations(),
    relationshipTypes: countRelationshipTypes(),
    birthsByDecade: groupBirthsByDecade(),
    livingMembers: familyMembers.filter(m => !m.death).length,
    genderDistribution: calculateGenderDistribution(),
    oldestMember: findOldestMember(),
    youngestMember: findYoungestMember(),
    commonBirthPlaces: findCommonBirthPlaces(),
    averageLifespan: calculateAverageLifespan(),
    familyLongevity: calculateFamilyLongevity(),
    siblingStats: calculateSiblingStats(),
    monthlyBirths: calculateMonthlyBirths()
  };
}

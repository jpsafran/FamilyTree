/* ui.js
   ----------
   Functions to show/hide modals, handle context menu actions,
   plus "openModal"/"closeModal" utilities.
*/

/** Show context menu at the pointer */
function showContextMenu(event, member) {
    event.preventDefault(); // Prevent default right-click
    window.currentContextMember = member;
    const menu = document.getElementById("context-menu");
    menu.style.display = "block";
    
    // Position the menu
    const x = event.clientX;
    const y = event.clientY;
    const menuWidth = menu.offsetWidth;
    const menuHeight = menu.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Adjust position if menu would go off screen
    menu.style.left = (x + menuWidth > windowWidth ? x - menuWidth : x) + "px";
    menu.style.top = (y + menuHeight > windowHeight ? y - menuHeight : y) + "px";
}

/** Hide the context menu */
function hideContextMenu() {
    const menu = document.getElementById("context-menu");
    menu.style.display = "none";
}

/** Open a modal by ID */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.style.display = "block";
        // Add animation class if needed
        modal.querySelector('.modal-content').style.transform = 'translateY(0)';
    }
}

/** Close a modal by ID */
function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        const content = modal.querySelector('.modal-content');
        content.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            modal.style.display = "none";
            content.style.transform = 'translateY(0)';
        }, 300);
    }
}

/** Show "View Info" modal */
function showInfoModal(member) {
    const modal = document.getElementById("info-modal");
    const content = modal.querySelector(".modal-content");
    
    // Calculate age and other derived info
    const age = calculateAge(member.birth, member.death);
    const lifeEvents = getLifeEvents(member);
    
    content.innerHTML = `
        <span class="close" onclick="closeModal('info-modal')">&times;</span>
        <h2>${member.name}</h2>
        
        <div class="member-image">
            <img src="${member.image || 'https://via.placeholder.com/150'}" 
                 alt="${member.name}"
                 onclick="showEnlargedPhoto(this.src)"
                 onerror="this.src='https://via.placeholder.com/150'">
        </div>

        <div class="info-grid">
            <div class="info-section">
                <h3>Personal Details</h3>
                <p>Gender: ${member.gender || 'Not specified'}</p>
                <p>Age: ${age}</p>
                <p>Birth: ${formatDate(member.birth)}</p>
                <p>Birthplace: ${member.birthPlace || 'Unknown'}</p>
                ${member.death ? `<p>Death: ${formatDate(member.death)}</p>` : ''}
                ${member.deathPlace ? `<p>Place of Death: ${member.deathPlace}</p>` : ''}
            </div>
            
            <div class="info-section">
                <h3>Family Connections</h3>
                ${getFamilyConnections(member)}
            </div>
            
            <div class="info-section">
                <h3>Additional Details</h3>
                <p>${member.details || 'No additional details available.'}</p>
            </div>
            
            <div class="info-timeline">
                <h3>Life Timeline</h3>
                ${lifeEvents.map(event => `
                    <div class="life-event">
                        <span class="life-event-date">${event.displayDate}&nbsp;&nbsp;</span>
                        <span>${event.description}</span>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="modal-actions">
            <button onclick="closeModal('info-modal')">Close</button>
            <button onclick="showEditModal(window.currentContextMember)">Edit</button>
            <button onclick="deleteMember(window.currentContextMember)">Delete</button>
        </div>
    `;
    
    openModal("info-modal");
}

// Add deleteMember function
function deleteMember(member) {
    if (confirm(`Are you sure you want to delete ${member.name}?`)) {
        familyMembers = familyMembers.filter(m => m.id !== member.id);
        relationships = relationships.filter(r => r.from !== member.id && r.to !== member.id);
        saveData();
        closeModal("info-modal");
        render();
    }
}

// Add new function for enlarged photo
function showEnlargedPhoto(src) {
    // Create photo modal if it doesn't exist
    let photoModal = document.getElementById('photo-modal');
    if (!photoModal) {
        photoModal = document.createElement('div');
        photoModal.id = 'photo-modal';
        photoModal.className = 'photo-modal';
        photoModal.innerHTML = `
            <span class="close" onclick="closePhotoModal()">&times;</span>
            <img src="" alt="Enlarged photo">
        `;
        document.body.appendChild(photoModal);
    }

    // Set image and show modal
    const img = photoModal.querySelector('img');
    img.src = src;
    photoModal.style.display = 'flex';

    // Close on click outside image
    photoModal.onclick = function(e) {
        if (e.target === photoModal) {
            closePhotoModal();
        }
    };
}

function closePhotoModal() {
    const photoModal = document.getElementById('photo-modal');
    if (photoModal) {
        photoModal.style.display = 'none';
    }
}

/** Show Add/Edit Member modal */
function showEditModal(member) {
    const title = document.getElementById("edit-modal-title");
    const form = document.getElementById("edit-form");

    // Clear and rebuild the form
    form.innerHTML = `
        <label for="edit-name">Name</label>
        <input type="text" id="edit-name" required>
        
        <label for="edit-birth">Birth Date</label>
        <input type="date" id="edit-birth">
        
        <label for="edit-birthplace">Place of Birth</label>
        <input type="text" id="edit-birthplace">
        
        <label for="edit-death">Death Date</label>
        <input type="date" id="edit-death">
        
        <label for="edit-deathplace">Place of Death</label>
        <input type="text" id="edit-deathplace">
        
        <label for="edit-gender">Gender</label>
        <select id="edit-gender">
            <option value="">Not specified</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
        </select>
        
        <label for="edit-image">Photo URL</label>
        <input type="text" id="edit-image">
        
        <label for="edit-details">Additional Details</label>
        <textarea id="edit-details" rows="4"></textarea>
    `;

    // Get all the input elements
    const nameInput = document.getElementById("edit-name");
    const birthInput = document.getElementById("edit-birth");
    const birthPlaceInput = document.getElementById("edit-birthplace");
    const deathInput = document.getElementById("edit-death");
    const deathPlaceInput = document.getElementById("edit-deathplace");
    const detailsInput = document.getElementById("edit-details");
    const imageInput = document.getElementById("edit-image");
    const genderSelect = document.getElementById("edit-gender");

    if (member) {
        title.textContent = "Edit Member";
        nameInput.value = member.name || "";
        birthInput.value = member.birth || "";
        birthPlaceInput.value = member.birthPlace || "";
        deathInput.value = member.death || "";
        deathPlaceInput.value = member.deathPlace || "";
        detailsInput.value = member.details || "";
        imageInput.value = member.image || "";
        genderSelect.value = member.gender || "";
    } else {
        title.textContent = "Add Member";
    }

    // Setup save button handler
    document.getElementById("edit-save-btn").onclick = () => {
        const newName = nameInput.value.trim();
        if (!newName) {
            alert("Name is required!");
            return;
        }

        if (member) {
            // Update existing member
            member.name = newName;
            member.birth = birthInput.value;
            member.birthPlace = birthPlaceInput.value;
            member.death = deathInput.value;
            member.deathPlace = deathInput.value;
            member.details = detailsInput.value;
            member.image = imageInput.value;
            member.gender = genderSelect.value;
        } else {
            // Create new member
            const newMember = {
                id: generateId(),
                name: newName,
                birth: birthInput.value,
                birthPlace: birthPlaceInput.value,
                death: deathInput.value,
                deathPlace: deathInput.value,
                details: detailsInput.value,
                image: imageInput.value,
                gender: genderSelect.value,
                x: 400,
                y: 300,
            };
            familyMembers.push(newMember);
        }
        
        saveData();
        closeModal("edit-modal");
        render();
    };

    openModal("edit-modal");
}

/** Show Relationship modal (Add) */
function showRelationshipModal(member) {
    const modal = document.getElementById("rel-modal");
    const content = modal.querySelector(".modal-content");
    
    content.innerHTML = `
        <span class="close" onclick="closeModal('rel-modal')">&times;</span>
        <h2>Add Relationship</h2>
        <p id="rel-chosen">Adding relationship for: ${member.name}</p>
        
        <label for="rel-target">Choose another member:</label>
        <select id="rel-target"></select>
        
        <label for="rel-type">Relationship type:</label>
        <select id="rel-type">
            <option value="parent">Parent</option>
            <option value="spouse">Spouse</option>
            <option value="sibling">Sibling</option>
        </select>

        <div id="marriage-date-field" style="display: none;">
            <label for="marriage-date">Marriage Date:</label>
            <input type="date" id="marriage-date">
        </div>
        
        <div class="modal-actions">
            <button onclick="closeModal('rel-modal')">Cancel</button>
            <button onclick="saveRelationship(${member.id})">Save</button>
        </div>
    `;

    // Show marriage date field when spouse is selected
    const typeSelect = document.getElementById("rel-type");
    const marriageDateField = document.getElementById("marriage-date-field");
    typeSelect.onchange = () => {
        marriageDateField.style.display = 
            typeSelect.value === "spouse" ? "block" : "none";
    };

    // Populate target select
    const targetSelect = document.getElementById("rel-target");
    familyMembers.forEach((m) => {
        if (m.id !== member.id) {
            const opt = document.createElement("option");
            opt.value = m.id;
            opt.textContent = m.name;
            targetSelect.appendChild(opt);
        }
    });
    
    openModal("rel-modal");
}

// Add this new function to handle relationship saving
function saveRelationship(fromId) {
    const targetId = parseInt(document.getElementById("rel-target").value, 10);
    const type = document.getElementById("rel-type").value;
    const marriageDate = document.getElementById("marriage-date")?.value;
    
    // Remove any existing relationships of same type between these members
    relationships = relationships.filter(r => 
        !((r.from === fromId && r.to === targetId) || 
          (r.from === targetId && r.to === fromId && r.type === type))
    );
    
    // Add new relationship with marriage date if applicable
    relationships.push({ 
        from: fromId, 
        to: targetId, 
        type: type,
        marriageDate: type === "spouse" ? marriageDate : null
    });
    
    saveData();
    closeModal("rel-modal");
    render();
}

/** Show "Manage Relationships" modal */
function showManageRelationshipsModal(member) {
    const modal = document.getElementById("manage-rel-modal");
    const content = modal.querySelector(".modal-content");
    
    content.innerHTML = `
        <span class="close" onclick="closeModal('manage-rel-modal')">&times;</span>
        <h2>Manage Relationships for ${member.name}</h2>
        <div id="rel-list-container">
            <ul id="manage-rel-list"></ul>
        </div>
        <div class="modal-actions">
            <button onclick="closeModal('manage-rel-modal')">Done</button>
        </div>
    `;

    // Populate relationship list
    const list = document.getElementById("manage-rel-list");
    const memberRels = relationships.filter(r => r.from === member.id || r.to === member.id);
    
    memberRels.forEach(rel => {
        const li = document.createElement("li");
        const otherId = rel.from === member.id ? rel.to : rel.from;
        const otherMember = familyMembers.find(m => m.id === otherId);
        
        li.innerHTML = `
            <span>${rel.type} → ${otherMember?.name || "Unknown"}</span>
            <button class="rel-delete-btn" onclick="deleteRelationship(${rel.from}, ${rel.to}, '${rel.type}')">×</button>
        `;
        
        list.appendChild(li);
    });
    
    openModal("manage-rel-modal");
}

// Add this new function to handle relationship deletion
function deleteRelationship(fromId, toId, type) {
    relationships = relationships.filter(r => 
        !(r.from === fromId && r.to === toId && r.type === type)
    );
    
    saveData();
    render();
    
    // Refresh the relationships modal
    const member = familyMembers.find(m => m.id === fromId);
    if (member) {
        showManageRelationshipsModal(member);
    }
}

function showAnalyticsModal() {
    const analytics = getAnalytics();
    const modal = document.getElementById("analytics-modal");
    
    modal.querySelector(".modal-content").innerHTML = `
        <span class="close" onclick="closeModal('analytics-modal')">&times;</span>
        <h2>Family Tree Analytics</h2>
        
        <div class="analytics-grid">
            <div class="stat-box">
                <h3>Overview</h3>
                <p>Total Members: ${analytics.totalMembers}</p>
                <p>Living Members: ${analytics.livingMembers}</p>
                <p>Average Age: ${analytics.averageAge}</p>
                <p>Family Generations: ${analytics.generations}</p>
                <p>Family Longevity: ${analytics.familyLongevity} years</p>
            </div>
            
            <div class="stat-box">
                <h3>Demographics</h3>
                ${Object.entries(analytics.genderDistribution)
                    .map(([gender, count]) => `<p>${capitalize(gender)}: ${count}</p>`)
                    .join('')}
                <p>Average Lifespan: ${analytics.averageLifespan} years</p>
            </div>
            
            <div class="stat-box">
                <h3>Birth Places</h3>
                ${Object.entries(analytics.commonBirthPlaces)
                    .map(([place, count]) => `<p>${place}: ${count}</p>`)
                    .join('')}
            </div>
            
            <div class="stat-box">
                <h3>Notable Members</h3>
                <p>Oldest: ${analytics.oldestMember ? analytics.oldestMember.name : 'N/A'}</p>
                <p>Youngest: ${analytics.youngestMember ? analytics.youngestMember.name : 'N/A'}</p>
            </div>
        </div>
        
        <div class="modal-actions">
            <button onclick="closeModal('analytics-modal')">Close</button>
            <button onclick="exportFamilyTreePDF()">Export to PDF</button>
        </div>
    `;
    
    openModal("analytics-modal");
}

// Add this error handler for PDF export
window.addEventListener('error', function(e) {
    if (e.message === "Cannot read properties of undefined (reading 'jsPDF')") {
        console.error('jsPDF not properly initialized');
        alert('PDF export failed to initialize. Please refresh the page and try again.');
    }
});

// Helper functions
function formatDate(dateStr) {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    // Add timezone offset to prevent date shifting
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function getLifeEvents(member) {
    const events = [];
    if (member.birth) {
        events.push({
            date: member.birth, // Store actual date string for sorting
            displayDate: formatDate(member.birth),
            description: `Born in ${member.birthPlace || 'unknown location'}`
        });
    }
    
    // Only include marriage events
    relationships
        .filter(r => (r.from === member.id || r.to === member.id) && r.type === "spouse" && r.marriageDate)
        .forEach(rel => {
            const otherMember = familyMembers.find(m => 
                m.id === (rel.from === member.id ? rel.to : rel.from)
            );
            if (otherMember) {
                events.push({
                    date: rel.marriageDate,
                    displayDate: formatDate(rel.marriageDate),
                    description: `Married ${otherMember.name}`
                });
            }
        });
    
    if (member.death) {
        events.push({
            date: member.death,
            displayDate: formatDate(member.death),
            description: `Passed away in ${member.deathPlace || 'unknown location'}`
        });
    }
    
    // Sort by actual dates
    return events.sort((a, b) => new Date(a.date) - new Date(b.date));
}

// Modify the timeline rendering to prevent overlaps
function renderTimeline() {
    const timelineContent = document.querySelector(".timeline-content");
    timelineContent.innerHTML = "";
    timelineContent.style.position = 'relative';

    // Sort members by birth date
    const sortedMembers = familyMembers
        .filter(m => m.birth)
        .sort((a, b) => new Date(a.birth) - new Date(b.birth));

    const itemHeight = 100;  // Increased height for better readability
    const itemMargin = 20;
    const itemWidth = 250;   // Wider items for more content

    sortedMembers.forEach((member, index) => {
        const item = document.createElement("div");
        item.className = "timeline-item";
        item.style.left = "20px";  // Fixed left position
        item.style.top = `${index * (itemHeight + itemMargin)}px`;
        item.style.width = `${itemWidth}px`;
        item.style.height = `${itemHeight}px`;
        
        item.innerHTML = `
            <strong>${member.name}</strong><br>
            ${formatDate(member.birth)}${member.death ? ` - ${formatDate(member.death)}` : ''}<br>
            ${member.birthPlace || ''}
        `;
        
        item.onclick = () => {
            window.currentContextMember = member;
            showInfoModal(member);
        };
        
        timelineContent.appendChild(item);
    });

    // Set container height to fit all items
    const totalHeight = sortedMembers.length * (itemHeight + itemMargin);
    timelineContent.style.height = `${totalHeight}px`;
    timelineContent.style.width = `${itemWidth + 40}px`; // Add some padding
}

function getFamilyConnections(member) {
    const connections = [];
    const parents = relationships
        .filter(r => r.to === member.id && r.type === 'parent')
        .map(r => familyMembers.find(m => m.id === r.from))
        .filter(m => m);
        
    const children = relationships
        .filter(r => r.from === member.id && r.type === 'parent')
        .map(r => familyMembers.find(m => m.id === r.to))
        .filter(m => m);
        
    const spouses = relationships
        .filter(r => (r.from === member.id || r.to === member.id) && r.type === 'spouse')
        .map(r => familyMembers.find(m => m.id === (r.from === member.id ? r.to : r.from)))
        .filter(m => m);
    
    if (parents.length) {
        connections.push(`Parents: ${parents.map(p => p.name).join(', ')}`);
    }
    if (spouses.length) {
        connections.push(`Spouses: ${spouses.map(s => s.name).join(', ')}`);
    }
    if (children.length) {
        connections.push(`Children: ${children.map(c => c.name).join(', ')}`);
    }
    
    return connections.length ? connections.join('<br>') : 'No family connections found';
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function initializeTimeline() {
    const panel = document.createElement('div');
    panel.className = 'timeline-panel';
    panel.innerHTML = `
        <div class="timeline-header">
            <h3>Family Timeline</h3>
            <button onclick="toggleTimeline()">×</button>
        </div>
        <div class="timeline-content">
            <div class="timeline-line"></div>
        </div>
    `;
    document.body.appendChild(panel);
}

function toggleTimeline() {
    const panel = document.querySelector('.timeline-panel');
    panel.classList.toggle('visible');
    if (panel.classList.contains('visible')) {
        renderTimeline();
    }
}

function renderTimeline() {
    const content = document.querySelector('.timeline-content');
    content.innerHTML = '<div class="timeline-line"></div>'; // Reset content except line

    // Filter and sort members by birth date
    const timelineMembers = familyMembers
        .filter(m => m.birth)
        .sort((a, b) => new Date(a.birth) - new Date(b.birth));

    if (timelineMembers.length === 0) {
        content.innerHTML += '<p style="text-align: center;">No dates available</p>';
        return;
    }

    // Calculate timeline parameters
    const firstDate = new Date(timelineMembers[0].birth);
    const lastDate = new Date(Math.max(
        ...timelineMembers.map(m => m.death ? new Date(m.death) : new Date())
    ));
    const timespan = lastDate - firstDate;
    const contentWidth = Math.max(content.offsetWidth, timespan / (1000 * 60 * 60 * 24 * 365) * 100);

    // Position items
    timelineMembers.forEach(member => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const birthDate = new Date(member.birth);
        const position = (birthDate - firstDate) / timespan;
        const xPos = position * (contentWidth - 200); // 200 is item width

        item.style.left = `${xPos}px`;
        item.style.top = position % 2 === 0 ? '20px' : '120px';
        
        item.innerHTML = `
            <strong>${member.name}</strong><br>
            ${formatDate(member.birth)}
            ${member.death ? `- ${formatDate(member.death)}` : ''}
        `;
        
        item.onclick = () => {
            window.currentContextMember = member;
            showInfoModal(member);
        };
        
        content.appendChild(item);
    });

    content.style.width = `${contentWidth}px`;
}

// Add this to your initialization code
document.addEventListener('DOMContentLoaded', initializeTimeline);

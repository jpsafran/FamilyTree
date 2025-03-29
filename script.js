// ...existing code...

// Prevent modals from auto-opening
document.addEventListener('DOMContentLoaded', () => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => modal.classList.remove('active'));
});

// Function to open a modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.querySelector('.modal-backdrop');
    if (modal) {
        modal.classList.add('active');
        backdrop.classList.add('active');
    }
}

// Function to close a modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    const backdrop = document.querySelector('.modal-backdrop');
    if (modal) {
        modal.classList.remove('active');
        backdrop.classList.remove('active');
    }
}

// Add event listeners for close buttons
document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        if (modal) closeModal(modal.id);
    });
});

// Close modal when clicking on the backdrop
document.querySelector('.modal-backdrop').addEventListener('click', () => {
    document.querySelectorAll('.modal.active').forEach(modal => closeModal(modal.id));
});

// Adjust zoom-out limits for the family tree
const treeSvg = document.getElementById('tree-svg');
let zoomLevel = 1;

function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 2); // Limit zoom-in to 2x
    treeSvg.style.transform = `scale(${zoomLevel})`;
}

function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.2); // Allow zoom-out to 0.2x
    treeSvg.style.transform = `scale(${zoomLevel})`;
}

// Ensure the tree container resizes dynamically
window.addEventListener('resize', () => {
    const treeContainer = document.getElementById('tree-container');
    treeContainer.style.height = `${window.innerHeight - 100}px`;
});

// ...existing code...

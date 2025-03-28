// drag.js

const treeContainer = document.getElementById('tree-container');
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

treeContainer.addEventListener('mousedown', e => {
  if (e.target.tagName === 'circle') return;
  isPanning = true;
  startX = e.pageX - treeContainer.offsetLeft;
  startY = e.pageY - treeContainer.offsetTop;
  scrollLeft = treeContainer.scrollLeft;
  scrollTop = treeContainer.scrollTop;
  treeContainer.style.cursor = 'grabbing';
});

treeContainer.addEventListener('mouseleave', () => {
  isPanning = false;
  treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mouseup', () => {
  isPanning = false;
  treeContainer.style.cursor = 'grab';
});

treeContainer.addEventListener('mousemove', e => {
  if (!isPanning) return;
  e.preventDefault();
  const x = e.pageX - treeContainer.offsetLeft;
  const y = e.pageY - treeContainer.offsetTop;
  const walkX = (x - startX);
  const walkY = (y - startY);
  treeContainer.scrollLeft = scrollLeft - walkX;
  treeContainer.scrollTop = scrollTop - walkY;
});

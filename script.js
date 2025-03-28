// script.js

document.addEventListener('DOMContentLoaded', () => {
  function refreshView() {
    renderTree();
    initRelationshipDrawing();
    attachClickHandlers();
  }

  function attachClickHandlers() {
    // Each node is a g.person-node
    d3.selectAll('.person-node')
      .on('click', (event, d) => {
        event.stopPropagation();
        showInfoModal(d);
      });
  }

  function showInfoModal(member) {
    document.getElementById('info-name').textContent = member.name || '';
    document.getElementById('info-birth').textContent = member.birth ? 'Born: ' + member.birth : 'No birth data';
    document.getElementById('info-death').textContent = member.death ? 'Died: ' + member.death : 'Alive';
    document.getElementById('info-age').textContent = 'Age: ' + calculateAge(member.birth, member.death);
    document.getElementById('info-details').textContent = member.details || '';
    document.getElementById('info-image').src = member.image || '';
    document.getElementById('info-modal').classList.remove('hidden');

    document.getElementById('edit-btn').onclick = () => editMember(member);
    document.getElementById('delete-btn').onclick = () => deleteMember(member);
  }

  function editMember(member) {
    document.getElementById('member-modal-title').textContent = 'Edit Member';
    document.getElementById('member-name').value = member.name || '';
    document.getElementById('member-birth').value = member.birth || '';
    document.getElementById('member-death').value = member.death || '';
    document.getElementById('member-details').value = member.details || '';
    document.getElementById('member-image').value = member.image || '';

    document.getElementById('member-save-btn').onclick = () => {
      member.name = document.getElementById('member-name').value;
      member.birth = document.getElementById('member-birth').value;
      member.death = document.getElementById('member-death').value;
      member.details = document.getElementById('member-details').value;
      member.image = document.getElementById('member-image').value;
      saveData();
      document.getElementById('member-modal').classList.add('hidden');
      document.getElementById('info-modal').classList.add('hidden');
      refreshView();
    };

    document.getElementById('member-modal').classList.remove('hidden');
  }

  function deleteMember(member) {
    familyMembers = familyMembers.filter(m => m.id !== member.id);
    relationships = relationships.filter(r => r.from !== member.id && r.to !== member.id);
    saveData();
    document.getElementById('info-modal').classList.add('hidden');
    refreshView();
  }

  // Add new member
  document.getElementById('add-member-btn').addEventListener('click', () => {
    document.getElementById('member-modal-title').textContent = 'Add Member';
    document.getElementById('member-name').value = '';
    document.getElementById('member-birth').value = '';
    document.getElementById('member-death').value = '';
    document.getElementById('member-details').value = '';
    document.getElementById('member-image').value = '';

    document.getElementById('member-save-btn').onclick = () => {
      const newMember = {
        id: generateId(),
        name: document.getElementById('member-name').value,
        birth: document.getElementById('member-birth').value,
        death: document.getElementById('member-death').value,
        details: document.getElementById('member-details').value,
        image: document.getElementById('member-image').value,
        x: null,
        y: null
      };
      familyMembers.push(newMember);
      saveData();
      document.getElementById('member-modal').classList.add('hidden');
      refreshView();
    };

    document.getElementById('member-modal').classList.remove('hidden');
  });

  // Analytics
  document.getElementById('analytics-btn').addEventListener('click', () => {
    const analytics = getAnalytics();
    const content = document.getElementById('analytics-content');
    content.innerHTML = `
      <p><strong>Total Members:</strong> ${analytics.total}</p>
      <p><strong>Living:</strong> ${analytics.living}</p>
      <p><strong>Deceased:</strong> ${analytics.deceased}</p>
      <p><strong>Average Age:</strong> ${analytics.avgAge}</p>
    `;
    document.getElementById('analytics-modal').classList.remove('hidden');
  });

  // Export, Import
  document.getElementById('export-btn').addEventListener('click', exportData);
  document.getElementById('import-json').addEventListener('change', importData);

  // Close modals
  document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').classList.add('hidden');
    });
  });

  // Start
  refreshView();
});

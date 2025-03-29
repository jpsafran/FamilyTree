// Initialize jsPDF
const { jsPDF } = window.jspdf;

async function exportFamilyTreePDF() {
    try {
        const pdf = new jsPDF('l', 'px', 'a4');
        const pageWidth = pdf.internal.pageSize.width;
        const pageHeight = pdf.internal.pageSize.height;
        const margin = 40;
        const colGap = 20;
        const leftColWidth = (pageWidth - (margin * 2) - colGap) / 2;
        const rightColWidth = leftColWidth;

        // Title page
        pdf.setFontSize(24);
        pdf.text('Family Tree', pageWidth/2, 60, { align: 'center' });
        pdf.setFontSize(12);
        pdf.text('Generated on ' + new Date().toLocaleDateString(), pageWidth/2, 80, { align: 'center' });

        // Capture tree visualization with better scaling
        const treeContainer = document.getElementById('tree-container');
        const containerBounds = treeContainer.getBoundingClientRect();
        const scale = 2; // Increase quality
        
        const canvas = await html2canvas(treeContainer, {
            scale: scale,
            width: containerBounds.width,
            height: containerBounds.height,
            windowWidth: containerBounds.width,
            windowHeight: containerBounds.height,
            logging: false,
            allowTaint: true,
            useCORS: true
        });

        // Calculate scaled dimensions to fit page
        const treeImage = canvas.toDataURL('image/jpeg', 1.0);
        const treeAspectRatio = canvas.width / canvas.height;
        const treeWidth = pageWidth - (margin * 2);
        const treeHeight = treeWidth / treeAspectRatio;

        // Add tree visualization on new page
        pdf.addPage();
        pdf.addImage(treeImage, 'JPEG', margin, margin, treeWidth, treeHeight);

        // Member details pages with improved layout
        for (let i = 0; i < familyMembers.length; i++) {
            const member = familyMembers[i];
            pdf.addPage();

            // Header spanning both columns
            pdf.setFontSize(24);
            pdf.setTextColor(44, 62, 80);
            const nameLines = pdf.splitTextToSize(member.name, pageWidth - (margin * 2));
            pdf.text(nameLines, margin, margin);
            let currentY = margin + (nameLines.length * 24) + 10;

            // Left column starting position
            let leftY = currentY;
            let rightY = currentY;

            // Helper function for text wrapping and positioning
            function addWrappedText(text, x, y, maxWidth, fontSize = 12) {
                pdf.setFontSize(fontSize);
                const lines = pdf.splitTextToSize(text, maxWidth);
                if (y + (lines.length * (fontSize + 2)) > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }
                pdf.text(lines, x, y);
                return y + (lines.length * (fontSize + 4));
            }

            // Left column content
            leftY = addWrappedText('Personal Details', margin, leftY, leftColWidth, 16);
            leftY += 10;

            // Photo if available
            if (member.image) {
                try {
                    const imgData = await fetch(member.image)
                        .then(response => response.blob())
                        .then(blob => new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result);
                            reader.readAsDataURL(blob);
                        }));
                    
                    if (imgData) {
                        const imgDim = 100;
                        pdf.addImage(imgData, 'JPEG', margin, leftY, imgDim, imgDim);
                        leftY += imgDim + 10;
                    }
                } catch (err) {
                    console.warn('Could not load image for:', member.name);
                }
            }

            // Personal details
            const details = [
                ['Birth Date', formatDate(member.birth)],
                ['Birth Place', member.birthPlace],
                ['Gender', member.gender],
                ['Death Date', member.death ? formatDate(member.death) : 'Living'],
                ['Death Place', member.deathPlace],
                ['Age', calculateAge(member.birth, member.death)]
            ];

            details.forEach(([label, value]) => {
                if (value) {
                    leftY = addWrappedText(`${label}: ${value}`, margin + 10, leftY, leftColWidth - 20);
                }
            });

            // Right column content
            rightY = addWrappedText('Family Connections', margin + leftColWidth + colGap, rightY, rightColWidth, 16);
            rightY += 10;

            const connections = getFamilyConnectionsArray(member);
            connections.forEach(connection => {
                rightY = addWrappedText(connection, margin + leftColWidth + colGap + 10, rightY, rightColWidth - 20);
            });

            rightY += 20;
            rightY = addWrappedText('Life Timeline', margin + leftColWidth + colGap, rightY, rightColWidth, 16);
            rightY += 10;

            const events = getLifeEvents(member);
            events.forEach(event => {
                const eventText = `${event.displayDate}: ${event.description}`;
                rightY = addWrappedText(eventText, margin + leftColWidth + colGap + 10, rightY, rightColWidth - 20);
            });

            // Additional details at the bottom if there's space
            const maxY = Math.max(leftY, rightY);
            if (member.details && maxY + 100 < pageHeight - margin) {
                let detailsY = maxY + 20;
                detailsY = addWrappedText('Additional Information', margin, detailsY, pageWidth - (margin * 2), 16);
                detailsY += 10;
                addWrappedText(member.details, margin + 10, detailsY, pageWidth - (margin * 2) - 20);
            }
        }

        pdf.save('family-tree.pdf');
    } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
    }
}

// Helper function to safely load images
async function safeLoadImage(url) {
    try {
        return await loadImage(url);
    } catch (err) {
        console.warn('Failed to load image:', url);
        return null;
    }
}

// Original image loading function
function loadImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });
}

function getFamilyConnectionsArray(member) {
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
    return connections.length ? connections : ['No family connections found'];
}

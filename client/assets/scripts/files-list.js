let selectedFile = '';

// Funzione per creare la struttura HTML per le cartelle e i file
function createFolderStructure(data) {
    const folderStructure = document.getElementById('folder-structure');
    
    for (const folderName in data) {
        const folderDiv = document.createElement('div');
        folderDiv.classList.add('folder');

        const arrowDiv = document.createElement('div');
        arrowDiv.classList.add('arrow');
        arrowDiv.textContent = '▶';

        const folderLabel = document.createElement('span');
        const files = data[folderName];
        const fileCount = Object.keys(files).length;

        folderLabel.textContent = `${folderName} [${fileCount}]`;

        const filesDiv = document.createElement('div');
        filesDiv.classList.add('files'); // Mantenuto per nascondere/mostrare i file

        if (fileCount > 0)
            for (let fileName in files) {
                const fileDiv = document.createElement('div');
                fileDiv.classList.add('file');
                fileName = fileName.replace(/xDOTx/g, '.');
                fileDiv.textContent = `${fileName}`;
                fileDiv.addEventListener('click', () => showPopup(fileName));
                filesDiv.appendChild(fileDiv);
            }

        folderDiv.appendChild(arrowDiv);
        folderDiv.appendChild(folderLabel);
        folderStructure.appendChild(folderDiv);
        folderStructure.appendChild(filesDiv); // Spostato qui per mettere i file sotto la cartella

        // Aggiungi evento per espandere o contrarre la cartella
        folderDiv.addEventListener('click', function () {
            const isVisible = filesDiv.style.display === 'block';
            filesDiv.style.display = isVisible ? 'none' : 'block';
            arrowDiv.classList.toggle('open', !isVisible); // Cambia la direzione della freccia
        });
    }
}

// Funzione per mostrare il popup
function showPopup(fileName) {
    selectedFile = fileName;
    document.getElementById('selected-file-name').textContent = `File: ${fileName}`;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('file-popup').style.display = 'block';
}

// Funzione per chiudere il popup
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('file-popup').style.display = 'none';
}

// Funzione per recuperare i dati dall'API
async function fetchData() {
    let errMsgComponent = document.getElementById('status-message');
    try {
        const response = await fetch('http://localhost:3000/api/folder');
        const data = await response.json();
        createFolderStructure(data.data);
    } catch (error) {
        errMsgComponent.textContent = "Server offline. Start the server and refresh the page.";
        console.log(error);
    }
}

// Event listeners per i pulsanti del popup
document.getElementById('download-btn').addEventListener('click', () => {
    alert(`Download del file: ${selectedFile}`);
    closePopup();
});

document.getElementById('delete-btn').addEventListener('click', () => {
    alert(`Elimina il file: ${selectedFile}`);
    closePopup();
});

document.getElementById('back-btn').addEventListener('click', closePopup);

// Esegui fetch dei dati appena la pagina viene caricata
window.onload = fetchData;

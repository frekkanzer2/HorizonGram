let selectedFile = '';
let selectedFolder = '';

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
                
                // Aggiungi evento per mostrare il popup con il file selezionato
                fileDiv.addEventListener('click', () => showPopup(fileName, folderName));
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
function showPopup(fileName, folderName) {
    selectedFile = fileName;
    selectedFolder = folderName;
    document.getElementById('selected-file-name').textContent = `File: ${fileName}`;
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('file-popup').style.display = 'block';
}

// Funzione per chiudere il popup
function closePopup() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('file-popup').style.display = 'none';
}

// Funzione per eliminare il file
async function deleteFile() {
    document.getElementById('loading-overlay').style.display = 'block'; // Mostra il messaggio di caricamento
    document.getElementById('loading-sub-message').style.display = 'none'; // Mostra il messaggio di caricamento

    const deleteUrl = 'http://localhost:3000/api/file';
    const deleteBody = {
        folder: selectedFolder,
        filename: selectedFile
    };

    try {
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(deleteBody)
        });

        if (response.ok) {
            alert(`Il file ${selectedFile} è stato eliminato con successo.`);
            window.location.reload(); // Aggiorna la pagina
        } else {
            alert('Errore durante l\'eliminazione del file. Riprovare.');
        }
    } catch (error) {
        console.error('Errore durante la richiesta DELETE:', error);
        alert('Errore di rete. Verificare la connessione e riprovare.');
    } finally {
        document.getElementById('loading-overlay').style.display = 'none'; // Nascondi il messaggio di caricamento
    }

    closePopup(); // Chiudi il popup
}

// Funzione per scaricare i chunk di un file grande
async function downloadFile() {
    closePopup(); // Chiudi il popup
    const statusMessage = document.getElementById('status-message');
    document.getElementById('loading-overlay').style.display = 'block'; // Mostra il messaggio di caricamento
    document.getElementById('loading-sub-message').style.display = 'block'; // Mostra il messaggio di caricamento

    console.log(`Downloading file ${selectedFile} from folder ${selectedFolder}`);
    const downloadResponse = await fetch('http://localhost:3000/api/file/download', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filename: selectedFile,
            folder: selectedFolder
        })
    });
    const downloadPath = (await downloadResponse.json()).downloadPath;

    statusMessage.textContent = `File downloaded in: \"${downloadPath}\"`;
    statusMessage.className = 'status-success-bg';

    document.getElementById('loading-sub-message').style.display = 'none'; // Mostra il messaggio di caricamento
    document.getElementById('loading-overlay').style.display = 'none'; // Nascondi il messaggio di caricamento
    
    errMsgComponent.textContent = "Server offline. Start the server and refresh the page.";
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
document.getElementById('download-btn').addEventListener('click', downloadFile);
document.getElementById('delete-btn').addEventListener('click', deleteFile);
document.getElementById('back-btn').addEventListener('click', closePopup);

// Esegui fetch dei dati appena la pagina viene caricata
window.onload = fetchData;

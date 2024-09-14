document.addEventListener("DOMContentLoaded", function () {
    const inputField = document.getElementById('folder-name');
    const submitButton = document.getElementById('delete-folder');
    const toggleDeleteFilesButton = document.getElementById('toggle-delete-files');
    const loadingOverlay = document.getElementById('loading-overlay');
    const statusMessage = document.getElementById('status-message');
    
    let shouldDeleteFiles = false;  // Variabile per tracciare lo stato dell'eliminazione dei file

    // Funzione per alternare lo stato del pulsante
    function toggleDeleteFiles() {
        shouldDeleteFiles = !shouldDeleteFiles;
        toggleDeleteFilesButton.value = shouldDeleteFiles ? "Internal file deletion ENABLED" : "Internal file deletion disabled";
        toggleDeleteFilesButton.className = shouldDeleteFiles ? 'important-button' : '';
        if (shouldDeleteFiles) {
            statusMessage.textContent = "All files in the selected folder will be deleted if you press Submit";
            statusMessage.className = 'status-error';
        } else {
            statusMessage.textContent = '';
            statusMessage.className = '';
        }
    }

    function validateInput(input) {
        const sanitizedInput = input.trim().replace(/\s+/g, '_');
        return /^[A-Za-z_]+$/.test(sanitizedInput);
    }

    // Funzione per ottenere tutte le cartelle e i file
    function getFolders() {
        return fetch('http://localhost:3000/api/folder')
        .then(response => {
            return response.json().then(data => {
                if (response.ok) {
                    return data.data;
                } else {
                    throw new Error('Error fetching folder data.');
                }
            });
        });
    }

    // Funzione per eliminare un singolo file
    function deleteFile(folderName, fileName) {
        fileName = fileName.replace(/xDOTx/g, '.');
        return fetch('http://localhost:3000/api/file', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ folder: folderName, filename: fileName })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error deleting file: ${fileName}`);
            }
            return response.json();
        });
    }

    // Funzione per eliminare tutti i file in una cartella
    function deleteFilesInFolder(folderName, files) {
        const deletePromises = Object.keys(files).map(file => deleteFile(folderName, file));
        return Promise.all(deletePromises);
    }

    // Funzione per eliminare una cartella
    function deleteFolder(folderName) {
        return fetch('http://localhost:3000/api/folder', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: folderName })
        }).then(response => {
            return response.json().then(data => {
                statusMessage.textContent = data.message;
                if (response.ok) {
                    const optionToRemove = Array.from(inputField.options).find(option => option.value === folderName);
                    if (optionToRemove) inputField.removeChild(optionToRemove);
                    statusMessage.className = 'status-success';
                } statusMessage.className = 'status-error';
                return data;
            });
        });
    }

    // Funzione principale per gestire la sottomissione
    function submitFolderName() {
        const inputValue = inputField.value;
        if (validateInput(inputValue)) {
            const sanitizedInput = inputValue.trim().replace(/\s+/g, '_');

            // Mostra l'overlay di caricamento e disabilita l'interazione
            loadingOverlay.style.display = 'block';
            statusMessage.style.display = 'none';
            document.body.style.pointerEvents = 'none';

            getFolders().then(folders => {
                if (!folders[sanitizedInput]) {
                    throw new Error('Folder not found.');
                }

                const filesInFolder = folders[sanitizedInput];

                // Se l'utente ha scelto di eliminare anche i file
                const deleteProcess = shouldDeleteFiles
                    ? deleteFilesInFolder(sanitizedInput, filesInFolder).then(() => deleteFolder(sanitizedInput))
                    : deleteFolder(sanitizedInput);

                deleteProcess
                    .catch(error => {
                        console.error('Error:', error);
                        statusMessage.textContent = 'An error occurred.';
                        statusMessage.className = 'status-error';
                    })
                    .finally(() => {
                        loadingOverlay.style.display = 'none';
                        statusMessage.style.display = 'block';
                        document.body.style.pointerEvents = 'auto';
                    });
            }).catch(error => {
                console.error('Error fetching folders:', error);
                statusMessage.textContent = 'Error loading folders. Please restart the server and reload the page.';
                statusMessage.className = 'status-error';
                loadingOverlay.style.display = 'none';
                statusMessage.style.display = 'block';
                document.body.style.pointerEvents = 'auto';
            });
        } else {
            alert('Invalid folder name. Only letters and underscores are allowed.');
        }
    }

    // Event listener per il pulsante di attivazione/disattivazione
    toggleDeleteFilesButton.addEventListener('click', toggleDeleteFiles);

    // Event listener per la sottomissione della cartella
    submitButton.addEventListener('click', submitFolderName);
});

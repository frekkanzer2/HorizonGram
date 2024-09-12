document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById('folder-name');
    const submitButton = document.getElementById('create-folder');
    const loadingOverlay = document.getElementById('loading-overlay');
    const statusMessage = document.getElementById('status-message');

    function validateInput(input) {
        // Rimuove gli spazi e sostituisce con underscore
        const sanitizedInput = input.trim().replace(/\s+/g, '_');
        // Verifica se contiene solo lettere e underscore
        return /^[A-Za-z_]+$/.test(sanitizedInput);
    }

    function submitFolderName() {
        const inputValue = inputField.value;
        if (validateInput(inputValue)) {
            const sanitizedInput = inputValue.trim().replace(/\s+/g, '_');
            const data = {
                name: sanitizedInput
            };

            // Mostra l'overlay di caricamento e disabilita l'interazione
            loadingOverlay.style.display = 'block';
            statusMessage.style.display = 'none';
            document.body.style.pointerEvents = 'none';

            fetch('http://localhost:3000/api/folder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                return response.json().then(data => {
                    // Controlla se il codice di stato è 2xx
                    if (response.ok) {
                        statusMessage.textContent = data.message || 'Folder successfully created';
                        statusMessage.className = 'status-success';
                    } else {
                        statusMessage.textContent = data.message || 'Error during creation';
                        statusMessage.className = 'status-error';
                    }
                    return data;
                });
            })
            .catch((error) => {
                console.error('Error:', error);
                // Mostra un messaggio di errore generico se non viene fornito un messaggio
                statusMessage.textContent = 'Error during creation';
                statusMessage.className = 'status-error';
            })
            .finally(() => {
                // Nasconde l'overlay e riabilita l'interazione
                loadingOverlay.style.display = 'none';
                statusMessage.style.display = 'block';
                document.body.style.pointerEvents = 'auto';
            });
        } else {
            alert('Invalid folder name. Only letters and underscores are allowed.');
        }
    }

    submitButton.addEventListener('click', submitFolderName);
});

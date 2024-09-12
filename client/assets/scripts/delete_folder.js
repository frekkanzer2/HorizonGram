document.addEventListener("DOMContentLoaded", function() {
    const inputField = document.getElementById('folder-name');
    const submitButton = document.getElementById('delete-folder');
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
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                return response.json().then(data => {
                    statusMessage.textContent = data.message;
                    if (response.ok) {
                        statusMessage.className = 'status-success';
                        const optionToRemove = Array.from(inputField.options).find(option => option.value === sanitizedInput);
                        if (optionToRemove) inputField.removeChild(optionToRemove);
                    }
                    else statusMessage.className = 'status-error';
                    return data;
                });
            })
            .catch((error) => { })
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

const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB chunk size
const MAX_CONCURRENT_UPLOADS = 5; // Maximum number of simultaneous uploads

document.addEventListener("DOMContentLoaded", function() {
    const filePicker = document.getElementById('file-picker');
    const uploadButton = document.getElementById('upload-button');
    const statusMessage = document.getElementById('status-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');

    if (!filePicker || !uploadButton || !statusMessage || !loadingOverlay || !loadingMessage) {
        console.error('One or more required elements are missing from the page.');
        return;
    }

    function updateLoadingMessage(current, total) {
        loadingMessage.textContent = `Loading status: ${current}/${total} chunks`;
    }

    function uploadChunk(file, chunk, index, folderName) {
        const formData = new FormData();
        formData.append('file', chunk, `${file.name}`);
        formData.append('filename', file.name);
        formData.append('folder', folderName);
        formData.append('chunkno', index);

        return fetch('http://localhost:3000/api/chunks/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.message !== 'File successfully uploaded and sent to Telegram') {
                throw new Error(data.message);
            }
        });
    }

    function checkFile(file, folderName) {
        loadingMessage.textContent = `Do not close this window! Preparing upload.`;
        return fetch('http://localhost:3000/api/chunks/upload/checks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                folder: folderName,
            }),
        })
        .then(response => response.json().then(data => {
            console.log(`Check has status ${response.status}`)
            if (response.status !== 200) {
                throw new Error(data.message);
            }
        }));
    }

    function prepareFile(file, folderName) {
        return fetch('http://localhost:3000/api/chunks/upload/preparation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                folder: folderName,
                totalChunks: Math.ceil(file.size / CHUNK_SIZE),
            }),
        })
        .then(response => response.json().then(data => {
            if (response.status !== 200) {
                throw new Error(data.message);
            }
            return Math.ceil(file.size / CHUNK_SIZE);
        }));
    }

    function processFile(file) {
        const folderName = document.getElementById('folder-name').value.trim();
        if (!folderName) {
            alert('Please enter a destination folder name.');
            return;
        }

        loadingOverlay.style.display = 'block';
        document.body.style.pointerEvents = 'none';

        checkFile(file, folderName)
            .then(() => prepareFile(file, folderName))
            .then(totalChunks => {
                let currentChunkIndex = 1;
                let activeUploads = 0;
                let completedChunks = 0;

                function uploadNextChunks() {
                    while (currentChunkIndex <= totalChunks && activeUploads < MAX_CONCURRENT_UPLOADS) {
                        const start = (currentChunkIndex - 1) * CHUNK_SIZE;
                        const end = Math.min(start + CHUNK_SIZE, file.size);
                        const chunk = file.slice(start, end);

                        // Update progress
                        updateLoadingMessage(completedChunks + 1, totalChunks);

                        // Upload the chunk
                        activeUploads++;
                        uploadChunk(file, chunk, currentChunkIndex, folderName)
                            .then(() => {
                                completedChunks++;
                                activeUploads--;

                                updateLoadingMessage(completedChunks, totalChunks);

                                if (completedChunks === totalChunks) {
                                    statusMessage.textContent = 'File upload complete!';
                                    statusMessage.className = 'status-success';
                                    loadingOverlay.style.display = 'none';
                                    document.body.style.pointerEvents = 'auto';
                                } else {
                                    uploadNextChunks(); // Continue uploading next chunks
                                }
                            })
                            .catch(error => {
                                console.error('Upload error:', error);
                                statusMessage.textContent = 'Error during upload';
                                statusMessage.className = 'status-error';
                                loadingOverlay.style.display = 'none';
                                document.body.style.pointerEvents = 'auto';
                            });

                        currentChunkIndex++;
                    }
                }

                uploadNextChunks();
            })
            .catch(error => {
                console.error('Preparation error:', error);
                statusMessage.textContent = `Error during preparation: ${error.message}`;
                statusMessage.className = 'status-error';
                loadingOverlay.style.display = 'none';
                document.body.style.pointerEvents = 'auto';
            });
    }

    uploadButton.addEventListener('click', function() {
        const file = filePicker.files[0];
        if (file) {
            processFile(file);
        } else {
            alert('Please select a file to upload.');
        }
    });
});

const CHUNK_SIZE = 20 * 1024 * 1024; // 20 MB chunk size

document.addEventListener("DOMContentLoaded", function() {
    const filePicker = document.getElementById('file-picker');
    const uploadButton = document.getElementById('upload-button');
    const statusMessage = document.getElementById('status-message');
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessageUp = document.getElementById('loading-message-up');
    const loadingMessageDown = document.getElementById('loading-message-down');

    function setLoadingMessage(messageUp, messageDown, turnOn) {
        loadingMessageUp.textContent = messageUp;
        loadingMessageDown.textContent = messageDown;
        loadingOverlay.style.display = turnOn ? 'block' : 'none';
    }

    if (!filePicker || !uploadButton || !statusMessage || !loadingOverlay || !loadingMessageUp || !loadingMessageDown) {
        console.error('One or more required elements are missing from the page.');
        return;
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
        setLoadingMessage("Do not close this window during the upload!", "Preparing phase...", true);
        return fetch('http://localhost:3000/api/chunks/upload/checks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                filename: file.name,
                folder: folderName,
            }),
        }).then(response => {
            return response.json().then(data => {
                console.log(`Check has status ${response.status}`)
                if (response.status !== 200) {
                    throw new Error(data.message);
                }
            });
        });
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
        .then(response => {
            return response.json().then(data => {
                if (response.status !== 200) {
                    setLoadingMessage(``, ``, false);
                    throw new Error(data.message);
                }
                return Math.ceil(file.size / CHUNK_SIZE);
            });
        });
    }

    function processFile(file, folderName) {
        const speedToConcurrentUploads = {
            1: 1,   // <10 Mbps
            2: 3,   // 10-30 Mbps
            3: 5,   // 30-50 Mbps
            4: 8,   // 50-100 Mbps
            5: 10,   // 100+ Mbps
        };
        const MAX_CONCURRENT_UPLOADS = speedToConcurrentUploads[document.getElementById('connection-speed').value];
        return new Promise((resolve, reject) => {
            document.body.style.pointerEvents = 'none';

            checkFile(file, folderName)
                .then(() => prepareFile(file, folderName))
                .then(totalChunks => {
                    let currentChunkIndex = 1; // Start index from 1
                    let activeUploads = 0; // Track the number of currently active uploads
                    let completedChunks = 0; // Track completed chunks

                    function uploadNextChunks() {
                        while (currentChunkIndex <= totalChunks && activeUploads < MAX_CONCURRENT_UPLOADS) { // Max 5 concurrent uploads
                            const start = (currentChunkIndex - 1) * CHUNK_SIZE;
                            const end = Math.min(start + CHUNK_SIZE, file.size);
                            const chunk = file.slice(start, end);
                            setLoadingMessage(`File "${file.name}"`, `Chunks uploaded: ${completedChunks} of ${totalChunks}`, true);

                            activeUploads++; // Increment active uploads count
                            uploadChunk(file, chunk, currentChunkIndex, folderName)
                                .then(() => {
                                    completedChunks++;
                                    activeUploads--; // Decrement active uploads count

                                    setLoadingMessage(`File "${file.name}"`, `Chunks uploaded: ${completedChunks} of ${totalChunks}`, true);

                                    if (completedChunks === totalChunks) {
                                        resolve(); // Resolve when all chunks are completed
                                    } else {
                                        uploadNextChunks(); // Upload the next chunk
                                    }
                                })
                                .catch(error => {
                                    console.error('Upload error:', error);
                                    statusMessage.textContent = `Error during upload of ${file.name}`;
                                    statusMessage.className = 'status-error';
                                    reject(error); // Reject the Promise on error
                                });

                            currentChunkIndex++; // Move to the next chunk index
                        }
                    }

                    uploadNextChunks(); // Start uploading chunks
                })
                .catch(error => {
                    console.error('Preparation error:', error);
                    statusMessage.textContent = `File ${file.name}: ${error.message}`;
                    statusMessage.className = 'status-error';
                    setLoadingMessage(``, ``, false);
                    reject(error);
                })
                .finally(() => {
                    document.body.style.pointerEvents = 'auto';
                });
        });
    }

    function processFilesSequentially(files) {
        statusMessage.textContent = ``;
        const folderName = document.getElementById('folder-name').value.trim();
        if (!folderName) {
            alert('Please enter a destination folder name.');
            return;
        }

        let currentIndex = 0;
        setLoadingMessage("Started bulk upload", "Picking files to upload", true);

        function uploadNextFile() {
            if (currentIndex >= files.length) {
                statusMessage.textContent = 'All files uploaded successfully!';
                statusMessage.className = 'status-success';
                setLoadingMessage(``, ``, false);
                return;
            }

            const file = files[currentIndex];
            processFile(file, folderName)
                .then(() => {
                    currentIndex++;
                    uploadNextFile(); // Upload the next file
                })
                .catch(error => {
                    console.error('Error during file upload:', error);
                    statusMessage.textContent = `Error during upload of ${file.name}`;
                    statusMessage.className = 'status-error';
                });
        }

        uploadNextFile(); // Start uploading the first file
    }

    uploadButton.addEventListener('click', function() {
        const files = filePicker.files;
        if (files.length > 0) {
            processFilesSequentially(files);
        } else {
            alert('Please select one or more files to upload.');
        }
    });
});

document.addEventListener("DOMContentLoaded", function() {

    // Funzione per controllare lo stato del server
    function checkServerStatus() {
        fetch('http://localhost:3000/api/status') // Sostituisci con il tuo endpoint
            .then(response => {
                const statusElement = document.getElementById('server-status');
                if (response.ok) {
                    statusElement.innerHTML = 'Server status: <strong>ON</strong>';
                } else {
                    statusElement.innerHTML = 'Server status: <strong style="color: red;">OFF</strong>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('server-status').innerHTML = 'Server status: <strong style="color: red;">OFF</strong>';
            });
    }

    // Controlla lo stato del server subito dopo che l'header è stato inserito
    checkServerStatus();
});
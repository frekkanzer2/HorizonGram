// Seleziona tutti i link con la classe 'nav-link scrollto'
const navLinks = document.querySelectorAll('.nav-link.scrollto');

// Aggiungi un evento di click su ciascun link
navLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        // Rimuovi la classe 'active' da tutti i link
        navLinks.forEach(nav => nav.classList.remove('active'));

        // Aggiungi la classe 'active' solo al link cliccato
        this.classList.add('active');
    });
});

// Seleziona tutte le sezioni che hanno un ID
const sections = document.querySelectorAll('article[id], section[id]');

// Funzione per rimuovere la classe 'active' da tutti i link
function removeActiveClasses() {
    navLinks.forEach(link => link.classList.remove('active'));
}

// Funzione per aggiungere la classe 'active' al link corrispondente alla sezione attiva
function addActiveClass(id) {
    const activeLink = document.querySelector(`.nav-link.scrollto[href="#${id}"]`);
    if (activeLink) {
        removeActiveClasses();
        activeLink.classList.add('active');
    }
}

// Usa IntersectionObserver per monitorare quando una sezione entra nel viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            addActiveClass(entry.target.id);
        }
    });
}, {
    threshold: 0.3 // Cambia il link attivo quando il 30% della sezione è visibile
});

// Osserva ogni sezione
sections.forEach(section => observer.observe(section));
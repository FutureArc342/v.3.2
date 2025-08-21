 // Variabler för att hantera popupens status och timer
let isPopupVisible = false;
let popupTimer; // Håller ID för vår setTimeout, så vi kan avbryta den

function initializeNewsPopup() {
    const newsLink = document.getElementById('news-popup-trigger');
    const popup = document.getElementById('news-popup');

    if (!newsLink || !popup) {
        return;
    }
    
    if (newsLink.dataset.listenerAttached) {
        return;
    }
    newsLink.dataset.listenerAttached = 'true';

    // En samlad funktion för att dölja popupen och städa upp
    const hidePopup = () => {
        if (!isPopupVisible) return; // Gör inget om den redan är dold

        clearTimeout(popupTimer); // Avbryt den automatiska timern
        popup.classList.remove('active');
        
        // Nollställ statusen efter att CSS-animationen är klar
        setTimeout(() => {
            isPopupVisible = false;
        }, 300); // Matchar transition-tiden i din CSS
    };

    // Lyssnare för att VISA popupen när man klickar på "Nyheter"
    newsLink.addEventListener('click', (event) => {
        event.preventDefault();
        if (isPopupVisible) return;

        isPopupVisible = true;
        popup.classList.add('active');

        // Starta den automatiska timern för att dölja popupen
        popupTimer = setTimeout(hidePopup, 1500);
    });

    // NYTT: Lyssnare för att DÖLJA popupen om man klickar på bakgrunden
    popup.addEventListener('click', (event) => {
        // 'event.target' är det specifika elementet man klickade på.
        // Vi vill bara dölja om man klickar på själva bakgrunden (`popup`),
        // inte på rutan med texten (`tech-popup`).
        if (event.target === popup) {
            hidePopup();
        }
    });
}


function includeHTML() {
    let elements = document.querySelectorAll("[include-html]");
    if (elements.length === 0) {
        // När inga fler HTML-komponenter finns att ladda, KÖR popup-skriptet.
        initializeNewsPopup();
        return;
    }

    elements.forEach(el => {
        let file = el.getAttribute("include-html");
        if (file) {
            fetch(file)
                .then(response => {
                    if (response.ok) return response.text();
                    throw new Error('Nätverksfel vid laddning av fil.');
                })
                .then(data => {
                    el.innerHTML = data;
                    el.removeAttribute("include-html");
                    // Anropa funktionen igen för att ladda nästa komponent i kön.
                    includeHTML(); 
                })
                .catch(error => console.error("Fel vid laddning av fil:", file, error));
        }
    });
}

document.addEventListener('DOMContentLoaded', includeHTML);
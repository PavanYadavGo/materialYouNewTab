/*
 * Material You NewTab
 * Copyright (c) 2023-2025 XengShi
 * Licensed under the GNU General Public License v3.0 (GPL-3.0)
 * https://www.gnu.org/licenses/
 */

const apiUrl = "https://quotes-api-self.vercel.app/quote/";
const quotesContainer = document.querySelector('.quotesContainer');
const authorName = document.querySelector('.authorName span');

const MIN_QUOTE_LENGTH = 60;
const MAX_QUOTE_LENGTH = 140;
const QUOTE_REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes

const defaultQuotes = [
    { quote: "The world is not beautiful. Therefore, it is.", author: "Kino no Tabi" },
    { quote: "You should enjoy the little detours. Because that's where you'll find the things more important than what you want.", author: "Ging Freecss" },
    { quote: "The only ones who should kill are those who are prepared to be killed.", author: "Lelouch vi Britannia" },
    { quote: "If you win, you live. If you lose, you die. If you don’t fight, you can’t win!", author: "Eren Yeager" },
    { quote: "I am the hope of the universe. I am the answer to all living things that cry out for peace...", author: "Son Goku (menacing mode)" },
    { quote: "This world is rotten, and those who are making it rot deserve to die.", author: "Light Yagami" },
    { quote: "You’re all just pieces on a board, waiting to be sacrificed.", author: "Sosuke Aizen" },
    { quote: "A lesson without pain is meaningless. That’s because you can’t gain something without sacrificing something else.", author: "Edward Elric" },
    { quote: "No matter how deep the night, it always turns to day, eventually.", author: "Brook" },
    { quote: "It's not about going back and fixing something; it's about moving forward and creating something better.", author: "Shoyo Hinata" }
];

async function fetchAndDisplayQuote() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        const { quote, author } = data;

        if (quote.length + author.length >= MIN_QUOTE_LENGTH && quote.length + author.length <= MAX_QUOTE_LENGTH) {
            const quoteData = { quote, author };
            localStorage.setItem("currentQuote", JSON.stringify(quoteData));
            localStorage.setItem("lastQuoteUpdate", Date.now().toString());
            displayQuote(quoteData);
        } else {
            fetchAndDisplayQuote(); // Retry
        }
    } catch (error) {
        console.error("Error fetching quote:", error);
        useDefaultQuote();
    }
}

function displayQuote(quoteData) {
    const { quote, author } = quoteData || defaultQuotes[0];
    quotesContainer.textContent = quote;
    authorName.textContent = author;
}

function useDefaultQuote() {
    let index = parseInt(localStorage.getItem("defaultQuoteIndex")) || 0;
    const fallback = defaultQuotes[index];
    index = (index + 1) % defaultQuotes.length;

    localStorage.setItem("defaultQuoteIndex", index.toString());
    localStorage.setItem("currentQuote", JSON.stringify(fallback));
    localStorage.setItem("lastQuoteUpdate", Date.now().toString());

    displayQuote(fallback);
}

function refreshQuoteIfNeeded() {
    const lastUpdated = parseInt(localStorage.getItem("lastQuoteUpdate")) || 0;
    const now = Date.now();

    if ((now - lastUpdated) >= QUOTE_REFRESH_INTERVAL) {
        fetchAndDisplayQuote().catch(useDefaultQuote);
    } else {
        const currentQuote = JSON.parse(localStorage.getItem("currentQuote") || "null");
        currentQuote ? displayQuote(currentQuote) : fetchAndDisplayQuote().catch(useDefaultQuote);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const hideSearchWith = document.getElementById("shortcut_switchcheckbox");
    const quotesToggle = document.getElementById("quotesToggle");
    const motivationalQuotesCont = document.getElementById("motivationalQuotesCont");
    const motivationalQuotesCheckbox = document.getElementById("motivationalQuotesCheckbox");
    const searchWithContainer = document.getElementById("search-with-container");

    hideSearchWith.checked = localStorage.getItem("showShortcutSwitch") === "true";
    motivationalQuotesCheckbox.checked = localStorage.getItem("motivationalQuotesVisible") !== "false";

    let quoteInterval = null;
    const clearQuotes = () => {
        localStorage.removeItem("currentQuote");
        localStorage.removeItem("lastQuoteUpdate");
        localStorage.removeItem("defaultQuoteIndex");
        if (quoteInterval) clearInterval(quoteInterval);
        quoteInterval = null;
    };

    const updateMotivationalQuotesState = () => {
        const showQuotes = motivationalQuotesCheckbox.checked;
        localStorage.setItem("motivationalQuotesVisible", showQuotes);

        if (!hideSearchWith.checked) {
            quotesToggle.classList.add("inactive");
            motivationalQuotesCont.style.display = "none";
            clearQuotes();
            return;
        }

        quotesToggle.classList.remove("inactive");
        searchWithContainer.style.display = showQuotes ? "none" : "flex";
        motivationalQuotesCont.style.display = showQuotes ? "flex" : "none";

        if (showQuotes) {
            refreshQuoteIfNeeded();
            if (!quoteInterval) quoteInterval = setInterval(refreshQuoteIfNeeded, 60 * 1000);
        } else {
            clearQuotes();
        }
    };

    updateMotivationalQuotesState();

    hideSearchWith.addEventListener("change", () => {
        searchWithContainer.style.display = "flex";
        updateMotivationalQuotesState();
    });
    motivationalQuotesCheckbox.addEventListener("change", updateMotivationalQuotesState);
});

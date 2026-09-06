// ==UserScript==
// @name         AMQ Shortest Answer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Collect all possible anime names and show the shortest valid answer substring from the current autocomplete list.
// @author       Aruu☆
// @match        https://animemusicquiz.com/*
// @match        https://*.animemusicquiz.com/*
// @downloadURL  https://github.com/Aru-gxtx/AMQscripts/raw/main/AMQ_shortest_answer.user.js
// @updateURL    https://github.com/Aru-gxtx/AMQscripts/raw/main/AMQ_shortest_answer.user.js
// @require      https://github.com/joske2865/AMQ-Scripts/raw/master/common/amqScriptInfo.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const PANEL_ID = 'amq-shortest-answer-panel';
    const MAX_SEARCH_LENGTH = 10;

    const shift_keys = ["!", "\"", "#", "$", "%", "&", "'", "(", ")", "=", "~", "|", "`", "{", "}", "+", "*", ":", "<", ">", "?","_"];
    const paste_keys = ["★","☆","·","♥","・","〜","†","×","♪","→","␣"];
    let total_len = 0;
    let best_len = 0;

    let latestNames = [];
    let latestBest = '';

    function asArray(value) {
        if (value == null) return [];
        if (Array.isArray(value)) return value;
        return [value];
    }

    function normalizeForSearch(value) {
        return String(value || '')
            .toLowerCase()
            .trim();
    }

    function getSubstrings(value, maxLength = MAX_SEARCH_LENGTH) {
        const text = normalizeForSearch(value);
        if (!text) return [];

        const result = [];

        for (let start = 0; start < text.length; start++) {
            for (let end = start + 1; end <= Math.min(text.length, start + maxLength); end++) {
                const candidate = text.slice(start, end).trim();
                if (candidate) result.push(candidate);
            }
        }

        return result;
    }

    function collectPossibleNames(data) {
        const songInfo = data && data.songInfo ? data.songInfo : {};
        const animeNames = songInfo.animeNames || {};
        const names = [
            ...asArray(animeNames.english),
            ...asArray(animeNames.romaji),
            ...asArray(animeNames.native),
            ...asArray(songInfo.altAnimeNames),
            ...asArray(songInfo.altAnimeNamesAnswers)
        ];

        return [...new Set(
            names
                .filter(Boolean)
                .map((name) => String(name).trim())
                .filter(Boolean)
        )];
    }

    function getAutocompleteSuggestions() {
        const controller = window.quiz &&
            window.quiz.answerInput &&
            window.quiz.answerInput.typingInput &&
            window.quiz.answerInput.typingInput.autoCompleteController;

        if (!controller || !Array.isArray(controller.list)) return [];

        const normalizedList = controller.list.map((entry) => normalizeForSearch(entry));
        total_len = normalizedList.length;
        best_len = normalizedList.reduce((max, entry) => Math.max(max, entry.length), 0);

        for (const entry of normalizedList) {
            const hasPaste = paste_keys.some((key) => entry.includes(key));
            const hasShift = shift_keys.some((key) => entry.includes(key));

            if (hasPaste) {
                total_len += 2;
            } else if (hasShift) {
                total_len += 1;
            }
        }

        return normalizedList;
    }

    function getSuggestions(search) {
        const controller = window.quiz &&
            window.quiz.answerInput &&
            window.quiz.answerInput.typingInput &&
            window.quiz.answerInput.typingInput.autoCompleteController;

        if (!controller || !Array.isArray(controller.list)) return [];

        if (typeof window.createAnimeSearchRegexQuery === 'function') {
            const regex = new RegExp(window.createAnimeSearchRegexQuery(search), 'i');
            return controller.list
                .filter((anime) => regex.test(anime))
                .sort((a, b) => a.length - b.length || (a < b ? -1 : 1))
                .slice(0, 25)
                .map((anime) => normalizeForSearch(anime));
        }

        const normalizedSearch = normalizeForSearch(search);
        return controller.list
            .map((anime) => normalizeForSearch(anime))
            .filter((anime) => anime.includes(normalizedSearch))
            .sort((a, b) => a.length - b.length || (a < b ? -1 : 1))
            .slice(0, 25);
    }

    function findShortestAnswer(names) {
        getAutocompleteSuggestions();
        if (!names.length) return '';

        const seen = new Set();
        const candidates = [];

        for (const name of names) {
            const cleaned = normalizeForSearch(name);
            if (cleaned) {
                candidates.push(cleaned);
            }

            for (const substring of getSubstrings(name)) {
                if (!seen.has(substring)) {
                    seen.add(substring);
                    candidates.push(substring);
                }
            }
        }

        let best = '';
        let bestSource = '';
        let bestLength = Number.POSITIVE_INFINITY;

        for (const candidate of candidates) {
            if (!candidate || candidate.length > MAX_SEARCH_LENGTH) continue;

            const candidateSuggestions = getSuggestions(candidate);
            const targetFound = candidateSuggestions.some((suggestion) =>
                names.some((name) => normalizeForSearch(name) === suggestion)
            );
            if (!targetFound) continue;

            const candidateSource = names.find((name) => normalizeForSearch(name).includes(candidate));
            const isShorter = candidate.length < bestLength;
            const isTie = candidate.length === bestLength && (!bestSource || String(candidateSource || '').length < String(bestSource || '').length);

            if (isShorter || isTie) {
                best = candidate;
                bestSource = candidateSource || bestSource;
                bestLength = candidate.length;
                best_len = bestLength;
            }
        }

        if (!best) {
            const shortestName = [...names]
                .map((name) => normalizeForSearch(name))
                .filter(Boolean)
                .sort((a, b) => a.length - b.length)[0];

            return shortestName || '';
        }

        return best;
    }

    function ensurePanel() {
        let panel = document.getElementById(PANEL_ID);
        const target = document.querySelector('div.qpSideContainer > div.row');

        if (!target) return null;

        if (!panel) {
            panel = document.createElement('div');
            panel.id = PANEL_ID;
            panel.style.cssText = [
                'margin-top: 8px',
                'padding: 8px 10px',
                'background: rgba(0,0,0,0.35)',
                'border-radius: 6px',
                'color: white',
                'font-size: 12px',
                'line-height: 1.5',
                'white-space: normal',
                'word-break: break-word'
            ].join('; ');
            target.appendChild(panel);
        }

        return panel;
    }

    function renderPanel() {
        const panel = ensurePanel();
        if (!panel) return;

        const names = latestNames.length ? latestNames : ['No names collected'];
        const answer = latestBest || 'No valid answer yet';

        panel.innerHTML = [
            '<div style="font-weight:700; margin-bottom:6px;">Shortest Answer</div>',
            '<div style="margin-top:8px;">' + answer + '</div>'
        ].join('');
    }

    function onSongPlayed(data) {
        const names = collectPossibleNames(data);
        latestNames = names;
        latestBest = findShortestAnswer(names);
        renderPanel();
    }

    function setup() {
        if (typeof window.Listener === 'function') {
            new window.Listener('answer results', onSongPlayed).bindListener();
        }

        if (window.quiz) {
            renderPanel();
        }
    }

    if (window.quiz) {
        setup();
    } else {
        window.addEventListener('load', setup, { once: true });
    }
})();
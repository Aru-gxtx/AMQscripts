# Aruu☆ AMQ Scripts

[![License](https://img.shields.io/github/license/Aru-gxtx/AMQscripts)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Aru-gxtx/AMQscripts)](https://github.com/Aru-gxtx/AMQ_shortest_answer/commits/main)
[![JavaScript](https://img.shields.io/badge/language-JavaScript-f7df1e?logo=javascript&logoColor=black)](AMQ_shortest_answer.user.js)

This repository is a collection of my personal scripts for the game [Anime Music Quiz](animemusicquiz.com). Click the headers to install one.

## [AMQ Shortest Answer](https://github.com/Aru-gxtx/AMQscripts/raw/main/AMQ_shortest_answer.user.js)

AMQ Shortest Answer displays the least amount of input time _(the shortest and fastest)_ answer at the end of a round. This was created to help me memorize and utilize the optimal answer when playing in no `/dd` mode _(particularly when the guess time is <7s where it matters)._

<details>
<summary>How it works?</summary>

This script collects available anime title variations, such as english, romaji, native, and alternative titles.

Next, based on the layout of characters on a Japanese 106/109 keyboard, it assign an estimated cost for typing each character _(please note that this is merely a personal approximation and not a figure derived from a formal typing study; I intend to update these values ​​should I come across researchs regarding _how finger positioning affects typing speed_ (or something similar))._

For the Shift key or characters requiring the Shift key for input, an automatic +2 is added-in addition to the count based on keyboard layout _(as the Shift key itself falls into the +2 category)._ Consequently, the total comes to +3 in the best-case scenario and +6 in the worst-case scenario.

For the Paste keys or characters that are not directly assigned to the keyboard _(without modifying key bindings)._ Using `Ctrl+V` alone incurs a +3 count; furthermore, a mouse action is also required to place the cursor to the pinned chat _(in no `/dd` games when paste keys are pinned in the chat area)._ Anyone would naturally prefer an easier input method if available, so this action has been assigned a +9 count.

After that, the script selects the title with the lowest total estimated input cost and displays it in the side panel.
</details>
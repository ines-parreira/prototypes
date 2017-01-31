/* Emoji component.
 *
 * Images from Twemoji:
 * https://github.com/twitter/twemoji.
 *
 * Aliases:
 * http://unicode.org/emoji/charts-beta/emoji-list.html#$HEX
 * (eg. http://unicode.org/emoji/charts-beta/emoji-list.html#1f44c)
 */

import React, {PropTypes} from 'react'

const emojis = {
    ok_hand: '👌',
    cookie: '🍪',
    rocket: '🚀'
}

function unicodeToHex(char) {
    return char.codePointAt(0).toString(16)
}

function emojiImgUrl(emojiChar) {
    return `${window.GORGIAS_ASSETS_URL || ''}/static/public/img/emoji/72x72/${unicodeToHex(emojiChar)}.png`
}

export const Emoji = ({name}) => {
    let emojiChar = name

    // name is alias
    if (name.length > 1) {
        Object.keys(emojis).some((alias) => {
            if (alias === name) {
                emojiChar = emojis[alias]
                return true
            }
        })
    }

    return <img src={emojiImgUrl(emojiChar)} alt={emojiChar} className="emoji" />
}

Emoji.propTypes = {
    name: PropTypes.string.isRequired
}

import React from 'react'

import Tooltip from '../../../components/Tooltip'
import {linkify} from '../../../../../utils/editor'

// documentation: https://github.com/draft-js-plugins/draft-js-plugins/blob/master/HOW_TO_CREATE_A_PLUGIN.md

// LINK
export const link = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && contentState.getEntity(entityKey).getType() === 'link'
            }, callback
        )
    },
    component: ({children, entityKey, contentState}) => { // eslint-disable-line
        const entity = contentState.getEntity(entityKey).getData()
        const {url} = entity
        const id = `link-${entityKey}`
        return (
            <a
                href={url}
                id={id}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
                <Tooltip
                    placement="top"
                    target={id}
                >
                    {url}
                </Tooltip>
            </a>
        )
    },
}

// URL FOUND IN TEXT
export const foundUrl = {
    strategy: (contentBlock, callback) => {
        // BUG double-closing curly braces, brackets, etc. break linkify-it detection,
        // because they're not valid URL characters.
        // https://github.com/markdown-it/linkify-it/issues/52
        // we just need the text start/end indexes,
        // so we can replace them with anything of the same length.
        const encodedText = contentBlock.get('text').replace(/{{(.*?)}}/g, (m, group) => `**${group}**`)
        const links = linkify.match(encodedText)

        if (!links) {
            return
        }

        links.forEach(link => callback(link.index, link.lastIndex))
    },
    component: ({decoratedText, children}) => { // eslint-disable-line
        const links = linkify.match(decoratedText)
        const url = links && links[0] ? links[0].url : ''
        return (
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
            </a>
        )
    }
}

export default [link, foundUrl]

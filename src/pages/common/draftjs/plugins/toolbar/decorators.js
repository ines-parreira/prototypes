import React from 'react'
import {Entity} from 'draft-js'
import {UncontrolledTooltip} from 'reactstrap'

import {linkify} from '../../../../../utils'

/* eslint-disable react/prop-types */
export default [{
    // LINK
    strategy: (contentBlock, callback) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && Entity.get(entityKey).getType() === 'link'
            }, callback
        )
    },
    component: ({children, entityKey}) => {
        const {url} = Entity.get(entityKey).getData()
        const id = `link-${entityKey}`
        return (
            <a
                href={url}
                id={id}
                target="_blank"
                rel="noopener noreferrer"
            >
                {children}
                <UncontrolledTooltip
                    placement="top"
                    target={id}
                    delay={0}
                >
                    {url}
                </UncontrolledTooltip>
            </a>
        )
    },
}, {
    // URL FOUND IN TEXT
    strategy: (contentBlock, callback) => {
        const links = linkify.match(contentBlock.get('text'))

        if (!links) {
            return
        }

        links.forEach(link => callback(link.index, link.lastIndex))
    },
    component: ({decoratedText, children}) => {
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
}]
/* eslint-enable react/prop-types */

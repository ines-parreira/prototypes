import React from 'react'
import {Entity} from 'draft-js'

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
    component: (props) => {
        const {url} = Entity.get(props.entityKey).getData()
        return (
            <a href={url} target="_blank" rel="noopener noreferrer">
                {props.children}
            </a>
        )
    },
}]
/* eslint-enable react/prop-types */

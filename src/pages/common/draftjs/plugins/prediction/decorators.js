import React from 'react'

import css from './prediction.less'

export const prediction = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges(
            (character) => {
                const entityKey = character.getEntity()
                return entityKey !== null && contentState.getEntity(entityKey).getType() === 'prediction'
            }, callback
        )
    },
    component: ({offsetKey, children, entityKey, getEditorState, contentState, setEditorState}) => { // eslint-disable-line
        const entity = contentState.getEntity(entityKey).getData()
        const {text} = entity

        return (
            <span
                className={css.component}
                contentEditable={false}
            >
                {text}
            </span>
        )
    },
}

export default [prediction]

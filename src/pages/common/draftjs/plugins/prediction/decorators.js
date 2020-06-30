import React from 'react'

import css from './prediction.less'

export const prediction = {
    strategy: (contentBlock, callback, contentState) => {
        contentBlock.findEntityRanges((character) => {
            const entityKey = character.getEntity()
            return (
                entityKey !== null &&
                contentState.getEntity(entityKey).getType() === 'prediction'
            )
        }, callback)
    },
    component: ({
        offsetKey, // eslint-disable-line no-unused-vars, react/prop-types
        children, // eslint-disable-line no-unused-vars, react/prop-types
        entityKey, // eslint-disable-line react/prop-types
        getEditorState, // eslint-disable-line no-unused-vars, react/prop-types
        contentState, // eslint-disable-line react/prop-types
        setEditorState, // eslint-disable-line no-unused-vars, react/prop-types
    }) => {
        const entity = contentState.getEntity(entityKey).getData()
        const {text} = entity

        return (
            <span className={css.component} contentEditable={false}>
                {text}
            </span>
        )
    },
}

export default [prediction]

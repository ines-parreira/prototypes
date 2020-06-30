/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React from 'react'
import PropTypes from 'prop-types'
import {fromJS} from 'immutable'

const MentionText = ({children, className}) => {
    return (
        <span className={className} spellCheck={false}>
            {children}
        </span>
    )
}

const Mention = (props) => {
    const {entityKey, contentState, theme = {}, children, decoratedText} = props

    const mention = fromJS(contentState.getEntity(entityKey).getData().mention)

    return (
        <MentionText
            entityKey={entityKey}
            mention={mention}
            theme={theme}
            className={theme.mention}
            decoratedText={decoratedText}
        >
            {children}
        </MentionText>
    )
}

MentionText.propTypes = {
    children: PropTypes.array,
    className: PropTypes.string,
}

Mention.propTypes = {
    entityKey: PropTypes.string,
    contentState: PropTypes.object,
    mentionComponent: PropTypes.object,
    theme: PropTypes.object,
    children: PropTypes.array,
    decoratedText: PropTypes.string,
}

export default Mention

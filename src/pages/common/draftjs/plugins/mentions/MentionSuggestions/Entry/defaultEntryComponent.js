/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React, {PropTypes} from 'react'

const defaultEntryComponent = (props) => {
    const {
        mention,
        theme,
        searchValue, // eslint-disable-line no-unused-vars
        ...parentProps
    } = props

    return (
        <div {...parentProps}>
            <span className={theme.mentionSuggestionsEntryText}>{mention.get('name')}</span>
        </div>
    )
}

defaultEntryComponent.propTypes = {
    mention: PropTypes.object,
    theme: PropTypes.object,
    searchValue: PropTypes.string
}

export default defaultEntryComponent

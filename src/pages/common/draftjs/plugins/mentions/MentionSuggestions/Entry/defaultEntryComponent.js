/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React, {PropTypes} from 'react'
import {AgentLabel} from '../../../../../utils/labels'

const defaultEntryComponent = (props) => {
    const {
        mention,
        theme,
        searchValue, // eslint-disable-line no-unused-vars
        ...parentProps
    } = props

    return (
        <div {...parentProps}>
            <AgentLabel
                className={theme.mentionSuggestionsEntryText}
                name={mention.get('name')}
                email={mention.get('email')}
            />
        </div>
    )
}

defaultEntryComponent.propTypes = {
    mention: PropTypes.object,
    theme: PropTypes.object,
    searchValue: PropTypes.string
}

export default defaultEntryComponent

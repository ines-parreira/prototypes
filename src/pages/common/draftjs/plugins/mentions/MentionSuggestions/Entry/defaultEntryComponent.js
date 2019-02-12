// @flow
/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React from 'react'

import {AgentLabel} from '../../../../../utils/labels'

type Props = {
    mention: Map<*,*>,
    theme: {
        mentionSuggestionsEntryText: string
    },
    searchValue?: string
}

const defaultEntryComponent = (props: Props) => {
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

export default defaultEntryComponent

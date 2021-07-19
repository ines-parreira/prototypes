/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */
import React from 'react'
import {Map} from 'immutable'

import {AgentLabel} from '../../../../../utils/labels'

type Props = {
    mention: Map<any, any>
    theme: {
        mentionSuggestionsEntryText: string
    }
    searchValue?: string
}

export default function DefaultEntryComponent({
    mention,
    theme,
    searchValue, // eslint-disable-line @typescript-eslint/no-unused-vars
    ...parentProps
}: Props) {
    return (
        <div {...parentProps}>
            <AgentLabel
                className={theme.mentionSuggestionsEntryText}
                name={mention.get('name')}
                profilePictureUrl={mention.getIn([
                    'meta',
                    'profile_picture_url',
                ])}
                shouldDisplayAvatar
            />
        </div>
    )
}

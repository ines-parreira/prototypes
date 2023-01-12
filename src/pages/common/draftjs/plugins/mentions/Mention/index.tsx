/**
 * Adapted from https://github.com/draft-js-plugins/draft-js-plugins/tree/master/draft-js-mention-plugin
 */

import React, {PropsWithChildren} from 'react'
import {fromJS} from 'immutable'
import {ContentState} from 'draft-js'
import {MentionPluginTheme, MentionData} from '../types'

type Props = {
    className?: string
    contentState: ContentState
    decoratedText?: string
    entityKey: string
    theme?: MentionPluginTheme
}

const MentionText = ({
    children,
    className,
}: PropsWithChildren<Omit<Props, 'contentState'> & {mention: MentionData}>) => {
    return (
        <span className={className} spellCheck={false}>
            {children}
        </span>
    )
}

export default function Mention({
    children,
    contentState,
    decoratedText,
    entityKey,
    theme = {},
}: PropsWithChildren<Props>) {
    const mention = fromJS(
        (
            contentState.getEntity(entityKey).getData() as {
                mention: MentionData
            }
        ).mention
    )

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

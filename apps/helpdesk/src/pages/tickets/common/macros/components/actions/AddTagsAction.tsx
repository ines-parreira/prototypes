import React, { useMemo } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import type { Tag, TicketTag } from '@gorgias/helpdesk-types'

import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'

type Props = {
    args: Map<string, string>
    index: number
    isDisabled?: boolean
    right?: boolean
    updateActionArgs: (index: number, args: Map<string, string>) => void
}

const AddTagsAction = ({
    args,
    index,
    isDisabled,
    right,
    updateActionArgs,
}: Props) => {
    const splitIncomingTags = useMemo(
        () =>
            args
                .get('tags', '')
                .split(',')
                .filter((t) => !!t),
        [args],
    )

    const addTag = (tag: Tag) => {
        const newTagList = splitIncomingTags.concat(tag.name).join(',')
        updateActionArgs(index, fromJS({ tags: newTagList }))
    }

    const removeTag = (tag: string) => {
        const initialTagList = [...splitIncomingTags]
        initialTagList.splice(initialTagList.indexOf(tag), 1)
        const newTagList = initialTagList.join(',')
        updateActionArgs(index, fromJS({ tags: newTagList }))
    }

    const ticketTags = useMemo(
        () =>
            splitIncomingTags.map(
                (tag) =>
                    ({
                        name: tag,
                        decoration: null,
                    }) as unknown as TicketTag,
            ),
        [splitIncomingTags],
    )

    return (
        <TicketTags
            ticketTags={ticketTags}
            isDisabled={isDisabled}
            addTag={addTag}
            removeTag={removeTag}
            right={right}
        />
    )
}

export default AddTagsAction

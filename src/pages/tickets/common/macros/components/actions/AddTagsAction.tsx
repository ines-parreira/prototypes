import React, {ComponentProps, useMemo} from 'react'
import {fromJS, List, Map} from 'immutable'
import {DropdownMenu} from 'reactstrap'

import TicketTags from 'pages/tickets/detail/components/TicketDetails/TicketTags'

type Props = {
    args: Map<string, string>
    dropdownContainer?: ComponentProps<typeof DropdownMenu>['container']
    index: number
    isDisabled?: boolean
    right?: boolean
    updateActionArgs: (index: number, args: Map<string, string>) => void
}

const AddTagsAction = ({
    args,
    dropdownContainer,
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
        [args]
    )

    const addTag = (tag: string) => {
        const newTagList = splitIncomingTags.concat(tag).join(',')
        updateActionArgs(index, fromJS({tags: newTagList}))
    }

    const removeTag = (tag: string) => {
        const initialTagList = [...splitIncomingTags]
        initialTagList.splice(initialTagList.indexOf(tag), 1)
        const newTagList = initialTagList.join(',')
        updateActionArgs(index, fromJS({tags: newTagList}))
    }

    const ticketTags = useMemo(
        () =>
            fromJS(splitIncomingTags.map((tag) => ({name: tag}))) as List<any>,
        [splitIncomingTags]
    )

    return (
        <TicketTags
            ticketTags={ticketTags}
            isDisabled={isDisabled}
            addTag={addTag}
            removeTag={removeTag}
            right={right}
            dropdownContainer={dropdownContainer}
        />
    )
}

export default AddTagsAction

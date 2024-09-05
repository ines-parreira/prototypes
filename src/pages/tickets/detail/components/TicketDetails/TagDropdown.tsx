import React, {useCallback, useMemo, useRef, useState} from 'react'
import {List, Map} from 'immutable'
import {Tag} from '@gorgias/api-queries'
import cn from 'classnames'

import {Item} from 'components/Dropdown'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import {TagDropdownMenu} from 'tags'

import css from './TagDropdown.less'

type Props = {
    addTag: (tag: Item) => void
    shouldBindKeys: boolean
    ticketTags: List<Map<any, any>>
    transparent?: boolean
}

const TagDropdown = ({
    addTag,
    shouldBindKeys,
    ticketTags,
    transparent,
}: Props) => {
    const targetRef = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const onToggle = (value: boolean) => {
        setIsDropdownOpen(value)
    }

    const existingTagNames = useMemo(
        () => ticketTags.map((x?: Map<any, any>) => x!.get('name') as string),
        [ticketTags]
    )

    const filterBy = useCallback(
        (tag: Tag) => !existingTagNames.contains(tag.name),
        [existingTagNames]
    )

    useConditionalShortcuts(shouldBindKeys, 'TicketDetailContainer', {
        OPEN_TAGS: {
            action: (e) => {
                // shortcut key gets typed in the search field otherwise
                e.preventDefault()
                onToggle(true)
            },
        },
    })

    return (
        <>
            <Button
                ref={targetRef}
                onClick={() => onToggle(!isDropdownOpen)}
                intent="secondary"
                fillStyle={transparent ? 'ghost' : 'fill'}
                size="small"
                className={cn({[css.isOpen]: isDropdownOpen})}
            >
                <ButtonIconLabel icon="add">Add tags</ButtonIconLabel>
            </Button>
            <Dropdown
                className={css.dropdown}
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={targetRef}
            >
                <TagDropdownMenu filterBy={filterBy} onClick={addTag} />
            </Dropdown>
        </>
    )
}

export default TagDropdown

import { useCallback, useMemo, useRef, useState } from 'react'

import cn from 'classnames'

import { Tag, TicketTag } from '@gorgias/helpdesk-queries'

import { Item } from 'components/Dropdown'
import useConditionalShortcuts from 'hooks/useConditionalShortcuts'
import Button from 'pages/common/components/button/Button'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import { TagDropdownMenu } from 'tags'

import css from './TagDropdown.less'

type Props = {
    addTag: (tag: Item) => void
    shouldBindKeys: boolean
    ticketTags: TicketTag[]
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
        () => ticketTags.map((x) => x.name),
        [ticketTags],
    )

    const filterBy = useCallback(
        (tag: Tag) => !existingTagNames.includes(tag.name),
        [existingTagNames],
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
        <div>
            <Button
                ref={targetRef}
                onClick={() => onToggle(!isDropdownOpen)}
                intent="secondary"
                fillStyle={transparent ? 'ghost' : 'fill'}
                size="small"
                className={cn({ [css.isOpen]: isDropdownOpen })}
                leadingIcon="add"
            >
                Add tags
            </Button>
            <Dropdown
                className={css.dropdown}
                isOpen={isDropdownOpen}
                onToggle={onToggle}
                target={targetRef}
            >
                <TagDropdownMenu filterBy={filterBy} onClick={addTag} />
            </Dropdown>
        </div>
    )
}

export default TagDropdown

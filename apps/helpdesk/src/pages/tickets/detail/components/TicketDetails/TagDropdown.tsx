import { useCallback, useMemo, useRef, useState } from 'react'

import { useConditionalShortcuts } from '@repo/utils'
import cn from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'
import type { Tag, TicketTag } from '@gorgias/helpdesk-queries'

import type { Item } from 'components/Dropdown'
import { Dropdown } from 'pages/common/components/dropdown/Dropdown'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { TagDropdownMenu } from 'tags'

import css from './TagDropdown.less'

type Props = {
    addTag: (tag: Item) => void
    disableTagCreation?: boolean
    shouldBindKeys: boolean
    ticketTags: TicketTag[]
    transparent?: boolean
}

const TagDropdown = ({
    addTag,
    disableTagCreation = false,
    shouldBindKeys,
    ticketTags,
    transparent,
}: Props) => {
    const targetRef = useRef<HTMLButtonElement>(null)
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const { isStandaloneAiAgent } = useStandaloneAiAccess()

    const onToggle = (value: boolean) => {
        setIsDropdownOpen(value)
    }

    const existingTagNames = useMemo(
        () => ticketTags.map((x) => x.name),
        [ticketTags],
    )

    const filterBy = useCallback(
        (tag: Tag) =>
            !existingTagNames.includes(tag.name) &&
            (!isStandaloneAiAgent || tag.name.startsWith('ai_')),
        [existingTagNames, isStandaloneAiAgent],
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
                <TagDropdownMenu
                    disableTagCreation={disableTagCreation}
                    filterBy={filterBy}
                    onClick={addTag}
                />
            </Dropdown>
        </div>
    )
}

export { TagDropdown }

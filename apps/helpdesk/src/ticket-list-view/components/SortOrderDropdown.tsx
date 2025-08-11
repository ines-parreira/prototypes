import { useRef, useState } from 'react'

import cn from 'classnames'

import { Tooltip } from '@gorgias/axiom'
import { ListViewItemsUpdatesOrderBy } from '@gorgias/helpdesk-types'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'
import { LabelWithTooltip } from 'pages/common/components/LabelWithTooltip/LabelWithTooltip'

import { sortOrderOptions } from '../hooks/useSortOrder'

import css from './SortOrderDropdown.less'

type Props = {
    onChange: (sortOrder: ListViewItemsUpdatesOrderBy) => void
    value: ListViewItemsUpdatesOrderBy
}

export default function SortingDropdown({ onChange, value }: Props) {
    const targetRef = useRef<HTMLButtonElement>(null)
    const [isOpen, setIsOpen] = useState(false)

    const isPriorityUsageEnabled = useFlag(
        FeatureFlagKey.TicketAllowPriorityUsage,
    )

    return (
        <>
            <IconButton
                className={cn(css.icon, { [css.isOpen]: isOpen })}
                ref={targetRef}
                intent="secondary"
                fillStyle="ghost"
                size="medium"
                onClick={() => {
                    setIsOpen(!isOpen)
                }}
            >
                swap_vert
            </IconButton>
            <Tooltip target={targetRef} innerProps={{ fade: false }}>
                Sort view by
            </Tooltip>
            <Dropdown
                target={targetRef}
                className={css.dropdown}
                isOpen={isOpen}
                onToggle={setIsOpen}
                value={value}
                placement="bottom-end"
            >
                <DropdownBody>
                    {sortOrderOptions(isPriorityUsageEnabled).map((option) => (
                        <DropdownItem
                            key={option.value}
                            onClick={onChange}
                            option={option}
                            shouldCloseOnSelect
                        >
                            <LabelWithTooltip
                                label={option.label}
                                tooltipText={option.tooltipText}
                                className={css.sortingLabel}
                                tooltipProps={{
                                    placement: 'right',
                                    innerProps: {
                                        fade: false,
                                        boundariesElement: 'viewport',
                                    },
                                }}
                            />
                        </DropdownItem>
                    ))}
                </DropdownBody>
            </Dropdown>
        </>
    )
}

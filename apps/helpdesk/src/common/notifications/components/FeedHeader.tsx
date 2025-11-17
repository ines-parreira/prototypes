import React, { useCallback, useRef, useState } from 'react'

import type { NotificationFeedHeaderProps } from '@knocklabs/react'
import { FilterStatus, useKnockFeed } from '@knocklabs/react'
import {
    logEvent,
    NotificationCenterEventTypes,
    SegmentEvent,
} from '@repo/logging'
import cn from 'classnames'
import _capitalize from 'lodash/capitalize'
import { Link } from 'react-router-dom'

import { LegacyButton as Button } from '@gorgias/axiom'

import IconButton from 'pages/common/components/button/IconButton'
import Dropdown from 'pages/common/components/dropdown/Dropdown'
import DropdownBody from 'pages/common/components/dropdown/DropdownBody'
import DropdownItem from 'pages/common/components/dropdown/DropdownItem'

import useCount from '../hooks/useCount'

import css from './FeedHeader.less'

const OrderedFilterStatuses = [
    FilterStatus.All,
    FilterStatus.Unread,
    FilterStatus.Read,
]

type FeedHeaderProps = NotificationFeedHeaderProps & {
    onToggleVisibility: () => void
}

export default function FeedHeader({
    filterStatus,
    setFilterStatus,
    onToggleVisibility,
}: FeedHeaderProps) {
    const { feedClient } = useKnockFeed()
    const count = useCount()
    const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
    const filterButtonRef = useRef<HTMLButtonElement>(null)

    const handleFilterStatusChange = useCallback(
        (status: FilterStatus) => {
            logEvent(SegmentEvent.NotificationCenter, {
                type: NotificationCenterEventTypes.Filter,
                value: status,
            })
            setFilterStatus(status)
            setIsFilterDropdownOpen(false)
        },
        [setFilterStatus],
    )

    const markAllAsRead = useCallback(() => {
        logEvent(SegmentEvent.NotificationCenter, {
            type: NotificationCenterEventTypes.MarkAllAsRead,
        })
        void feedClient.markAllAsRead()
    }, [feedClient])

    return (
        <div className={css.container}>
            <div className={css.flexSection}>
                <div className={css.heading}>Notifications</div>
                <Button
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    onClick={() => {
                        setIsFilterDropdownOpen(true)
                    }}
                    ref={filterButtonRef}
                >
                    <span>{filterStatus}</span>
                    <i className={cn('material-icons', css.selectIcon)}>
                        arrow_drop_down
                    </i>
                </Button>
                <Dropdown
                    isOpen={isFilterDropdownOpen}
                    onToggle={setIsFilterDropdownOpen}
                    target={filterButtonRef}
                    root={filterButtonRef?.current?.parentElement ?? undefined}
                    value={filterStatus}
                >
                    <DropdownBody className={css.dropdownBody}>
                        {OrderedFilterStatuses.map((option) => (
                            <DropdownItem
                                key={option}
                                className={css.dropdownItem}
                                option={{
                                    label: _capitalize(option),
                                    value: option,
                                }}
                                onClick={handleFilterStatusChange}
                            />
                        ))}
                    </DropdownBody>
                </Dropdown>
            </div>
            <div className={css.flexSection}>
                <Button
                    size="small"
                    fillStyle="ghost"
                    intent="secondary"
                    onClick={markAllAsRead}
                    isDisabled={count === 0}
                >
                    Mark all as read
                </Button>
                <Link
                    to="/app/settings/notifications"
                    className={css.settingsLink}
                >
                    <IconButton
                        size="small"
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => {
                            logEvent(SegmentEvent.NotificationCenter, {
                                type: NotificationCenterEventTypes.GoToSettings,
                            })
                            onToggleVisibility()
                        }}
                    >
                        settings
                    </IconButton>
                </Link>
            </div>
        </div>
    )
}

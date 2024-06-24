import {FeedItem, FeedItem as KnockFeedItem} from '@knocklabs/client'
import {
    NotificationFeedHeaderProps,
    NotificationFeedPopover,
    RenderItemProps,
    useKnockFeed,
} from '@knocklabs/react'
import cn from 'classnames'
import React, {useCallback, useRef, useState} from 'react'

import navbarCss from 'assets/css/navbar.less'
import Button from 'pages/common/components/button/Button'
import ButtonIconLabel from 'pages/common/components/button/ButtonIconLabel'
import {logEvent, SegmentEvent} from 'common/segment'

import useCount from '../hooks/useCount'
import transformKnockNotification from '../utils/transformKnockNotification'
import {RawNotification} from '../types'

import FeedHeader from './FeedHeader'
import FeedItemComponent from './FeedItem'
import css from './Button.less'
import './Feed.less'

export default function NotificationsButton() {
    const count = useCount()
    const {feedClient} = useKnockFeed()

    const buttonRef = useRef<HTMLButtonElement>(null)
    const [isVisible, setIsVisible] = useState(false)

    const handleClick = useCallback(() => {
        if (!isVisible) {
            logEvent(SegmentEvent.NotificationCenterOpened)
        }
        setIsVisible(!isVisible)
    }, [isVisible])

    const handleClickNotification = useCallback(
        (item: KnockFeedItem) => {
            logEvent(SegmentEvent.NotificationFeedItemClicked)
            void feedClient.markAsRead(item)
            setIsVisible(false)
        },
        [feedClient]
    )

    const handleToggleRead = useCallback(
        (item: KnockFeedItem) => {
            const isRead = !!item.read_at

            logEvent(SegmentEvent.NotificationStatusToggled, {
                status: isRead ? 'unread' : 'read',
            })
            isRead
                ? void feedClient.markAsUnread(item)
                : void feedClient.markAsRead(item)
        },
        [feedClient]
    )

    const handleClose = useCallback((e: Event) => {
        if (buttonRef.current?.contains(e.target as Node)) {
            e.stopPropagation()
        }
        setIsVisible(false)
    }, [])

    const renderItem = useCallback(
        ({item}: RenderItemProps) => {
            const notification = transformKnockNotification(
                // remove cast after consultation with knock team
                item as FeedItem<RawNotification>
            )
            return !notification ? null : (
                <FeedItemComponent
                    key={notification.id}
                    notification={notification}
                    onClick={() => handleClickNotification(item)}
                    onToggleRead={() => handleToggleRead(item)}
                />
            )
        },
        [handleClickNotification, handleToggleRead]
    )

    const renderHeader = useCallback(
        (renderHeaderProps: NotificationFeedHeaderProps) => (
            <FeedHeader
                {...renderHeaderProps}
                toggleVisibility={() => setIsVisible(false)}
            />
        ),
        []
    )

    return (
        <>
            <Button
                ref={buttonRef}
                className={navbarCss.navbarButton}
                fillStyle="ghost"
                onClick={handleClick}
            >
                <span className={cn(navbarCss['item-name'], css.name)}>
                    <ButtonIconLabel
                        icon="notifications"
                        className={navbarCss.buttonIcon}
                    />
                    Notifications
                </span>
                {count > 0 && (
                    <span className={cn(navbarCss['item-count'], css.count)}>
                        {count}
                    </span>
                )}
            </Button>
            <NotificationFeedPopover
                buttonRef={buttonRef}
                isVisible={isVisible}
                placement="right-start"
                renderItem={renderItem}
                onClose={handleClose}
                renderHeader={renderHeader}
            />
        </>
    )
}

import { useCallback, useEffect, useState } from 'react'

import { useHelpdeskV2WayfindingMS1Flag } from '@repo/feature-flags'
import { usePrevious } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import { NavigationSection, NavigationSectionItem } from '@repo/navigation'
import classnames from 'classnames'
import type { List, Map } from 'immutable'
import { fromJS } from 'immutable'
import { Link, useLocation } from 'react-router-dom'

import { Quantity, Text } from '@gorgias/axiom'

import navbarCss from 'assets/css/navbar.less'
import { Navigation } from 'components/Navigation/Navigation'
import { MAX_RECENT_CHATS } from 'config/recentChats'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { channelToCommunicationIcon } from 'pages/common/components/infobar/Infobar/TicketTimelineWidget/channelToCommunicationIcon'
import SourceIcon from 'pages/common/components/SourceIcon'
import { closePanels } from 'state/layout/actions'
import { activeViewIdSet } from 'state/ui/views/actions'
import { setViewActive } from 'state/views/actions'
import { isCurrentlyOnTicket } from 'utils'

import css from './RecentChats.less'

type ItemProps = {
    recentTicket: Map<any, any>
    position: number
}

const RecentChatsItem = ({ recentTicket, position }: ItemProps) => {
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()
    const dispatch = useAppDispatch()
    const channel = recentTicket.get('channel')
    const customer: Map<any, any> = recentTicket.get('customer') || fromJS({})
    const customerName =
        customer.get('name') ||
        customer.get('email') ||
        `Customer #${customer.get('id') as number}`

    const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
    const linkClasses = classnames(css.menuItem, {
        [css.hasSomethingNew]: recentTicket.get('is_unread') && !isActive,
    })

    const onClick = () => {
        logEvent(SegmentEvent.RecentActivityClicked, {
            position,
            ticket: recentTicket.toJS(),
        })
        dispatch(closePanels())
        dispatch(setViewActive(fromJS({})))
        dispatch(activeViewIdSet(null))
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NavigationSectionItem
                label={customerName}
                to={`/app/ticket/${recentTicket.get('id')}`}
                onClick={() => {
                    logEvent(SegmentEvent.RecentActivityClicked, {
                        position,
                        ticket: recentTicket.toJS(),
                    })
                }}
                leadingSlot={channelToCommunicationIcon(channel)}
            />
        )
    }

    return (
        <Navigation.SectionItem
            as={Link}
            to={`/app/ticket/${recentTicket.get('id') as number}`}
            className={linkClasses}
            title={customerName}
            onClick={onClick}
            isSelected={isActive}
        >
            <SourceIcon type={channel} />
            <span>{customerName}</span>
        </Navigation.SectionItem>
    )
}

export const RecentChats = () => {
    const location = useLocation()
    const previousPathname = usePrevious(location.pathname)
    const chats = useAppSelector((state) => state.chats)
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const [dummyState, setDummyState] = useState(false)

    const forceUpdate = useCallback(() => {
        setDummyState(!dummyState)
    }, [dummyState])

    useEffect(() => {
        if (location.pathname !== previousPathname) {
            forceUpdate()
        }
    }, [forceUpdate, location, previousPathname])

    const tickets = chats.get('tickets') as List<Map<any, any>>

    if (!tickets || tickets.isEmpty()) {
        return null
    }

    if (hasWayfindingMS1Flag) {
        return (
            <NavigationSection
                id="real-time-messaging"
                label={
                    <Text variant="regular" size="sm">
                        Real-time
                    </Text>
                }
                trailingSlot={<Quantity quantity={tickets.size} />}
            >
                {tickets.toArray().map((e, index) => (
                    <RecentChatsItem
                        key={e!.get('id')}
                        recentTicket={e!}
                        position={index! + 1}
                    />
                ))}
            </NavigationSection>
        )
    }

    return (
        <div className={css.recentChatsContainer}>
            <h4 className={navbarCss['category-title']}>
                <span>Chat & messaging</span>
            </h4>
            <div className={css.recentChatsList}>
                {tickets
                    .slice(0, MAX_RECENT_CHATS)
                    .toArray()
                    .map((e, index) => (
                        <RecentChatsItem
                            key={e!.get('id')}
                            recentTicket={e!}
                            position={index! + 1}
                        />
                    ))}
            </div>
        </div>
    )
}

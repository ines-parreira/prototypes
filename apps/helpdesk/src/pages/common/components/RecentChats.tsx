import React, { useCallback, useEffect, useState } from 'react'

import { usePrevious } from '@repo/hooks'
import { logEvent, SegmentEvent } from '@repo/logging'
import classnames from 'classnames'
import { fromJS, List, Map } from 'immutable'
import { Link, useLocation } from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import { MAX_RECENT_CHATS } from 'config/recentChats'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { closePanels } from 'state/layout/actions'
import { activeViewIdSet } from 'state/ui/views/actions'
import { setViewActive } from 'state/views/actions'
import { isCurrentlyOnTicket } from 'utils'

import SourceIcon from './SourceIcon'

import css from './RecentChats.less'

type ItemProps = {
    recentTicket: Map<any, any>
    position: number
}

const RecentChatsItem = ({ recentTicket, position }: ItemProps) => {
    const dispatch = useAppDispatch()
    const channel = recentTicket.get('channel')
    const customer: Map<any, any> = recentTicket.get('customer') || fromJS({})
    const customerName =
        customer.get('name') ||
        customer.get('email') ||
        `Customer #${customer.get('id') as number}`

    const isActive = isCurrentlyOnTicket(recentTicket.get('id'))
    const linkClasses = classnames(navbarCss.link, css.menuItem, {
        active: isActive,
        focused: isActive,
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

    return (
        <div className={navbarCss['link-wrapper']}>
            <Link
                onClick={onClick}
                to={`/app/ticket/${recentTicket.get('id') as number}`}
                className={linkClasses}
                title={customerName}
            >
                <span className={css['chat-title']}>
                    <SourceIcon type={channel} />
                    <span>{customerName}</span>
                </span>
            </Link>
        </div>
    )
}

const RecentChats = () => {
    const location = useLocation()
    const previousPathname = usePrevious(location.pathname)
    const chats = useAppSelector((state) => state.chats)

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

    return !tickets || tickets.isEmpty() ? null : (
        <div className={navbarCss.category}>
            <h4 className={navbarCss['category-title']}>
                <span>Chat & messaging</span>
            </h4>
            <div className={navbarCss.menu}>
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

export default RecentChats

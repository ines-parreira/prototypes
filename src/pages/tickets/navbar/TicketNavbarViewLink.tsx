import React, {
    forwardRef,
    ForwardedRef,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'
import classnames from 'classnames'
import {Link, useLocation} from 'react-router-dom'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import navbarCss from 'assets/css/navbar.less'
import useViewId from 'hooks/useViewId'
import {View} from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import {activeViewIdSet} from 'state/ui/views/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {useSplitTicketView} from 'split-ticket-view-toggle'
import {isTicketPath} from 'utils'

type Props = {
    className?: string
    icon?: string
    view: View
    viewCount?: number
}

const TicketNavbarViewLink = (
    {className, icon, view, viewCount}: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>
) => {
    const {isEnabled: splitTicketViewEnabled} = useSplitTicketView()
    const {pathname: path} = useLocation()

    const viewId = useViewId()
    const isTicketUrl = useMemo(() => isTicketPath(path), [path])

    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const isActiveView = isTicketUrl && view.id === viewId

    const dispatch = useAppDispatch()
    const ticketNavbarId = `ticket-navbar-view-${view.id}`

    useScrollActiveItemIntoView(ref, isActiveView, true)

    return (
        <div
            id={ticketNavbarId}
            ref={ref}
            className={classnames(navbarCss['link-wrapper'], {
                [navbarCss.isNested]: view.section_id != null,
            })}
        >
            <Link
                className={classnames(
                    navbarCss.link,
                    {
                        [navbarCss.isNested]: view.section_id != null,
                        active: isActiveView,
                    },
                    className
                )}
                to={
                    splitTicketViewEnabled
                        ? `/app/views/${view.id}`
                        : `/app/tickets/${view.id}/${encodeURIComponent(
                              view.slug
                          )}`
                }
                onClick={() => dispatch(activeViewIdSet(view.id))}
            >
                <span className={navbarCss['item-name']}>
                    {icon && (
                        <i
                            className={classnames(
                                'material-icons',
                                navbarCss.icon
                            )}
                        >
                            {icon}
                        </i>
                    )}
                    <ViewName
                        viewName={view.name}
                        emoji={view.decoration?.emoji}
                    />
                </span>
                <span className={navbarCss['item-count']}>
                    <ViewCount
                        viewId={view.id}
                        viewCount={viewCount}
                        isDeactivated={!!view.deactivated_datetime}
                    />
                </span>
            </Link>
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(TicketNavbarViewLink)

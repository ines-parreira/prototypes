import React, {forwardRef, Ref} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import useAppSelector from 'hooks/useAppSelector'
import {View} from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import {activeViewIdSet} from 'state/ui/views/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {getActiveView} from 'state/views/selectors'

import css from './TicketNavbarViewLink.less'

type Props = {
    className?: string
    icon?: string
    view: View
    viewCount?: number
}

const TicketNavbarViewLink = forwardRef(
    (
        {className, icon, view, viewCount}: Props,
        ref: Ref<HTMLDivElement> | null | undefined
    ) => {
        const activeView = useAppSelector(getActiveView)

        const dispatch = useAppDispatch()
        const ticketNavbarId = `ticket-navbar-view-${view.id}`

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
                            active: view.id === activeView.get('id'),
                        },
                        className
                    )}
                    to={`/app/tickets/${view.id}/${encodeURIComponent(
                        view.slug
                    )}`}
                    onClick={() => dispatch(activeViewIdSet(view.id))}
                >
                    <span
                        className={classnames(navbarCss['item-name'], css.link)}
                    >
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
)

export default TicketNavbarViewLink

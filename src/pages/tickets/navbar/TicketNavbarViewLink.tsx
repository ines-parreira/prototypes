import {useFlags} from 'launchdarkly-react-client-sdk'
import React, {
    forwardRef,
    useRef,
    ForwardedRef,
    useImperativeHandle,
} from 'react'
import classnames from 'classnames'
import {Link} from 'react-router-dom'

import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import navbarCss from 'assets/css/navbar.less'
import {FeatureFlagKey} from 'config/featureFlags'
import useViewId from 'hooks/useViewId'
import {View} from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import {activeViewIdSet} from 'state/ui/views/actions'
import useAppDispatch from 'hooks/useAppDispatch'
import {useSplitTicketView} from 'split-ticket-view-toggle'

import css from './TicketNavbarViewLink.less'

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
    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]
    const [splitTicketViewEnabled] = useSplitTicketView()

    const viewId = useViewId()

    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const isActiveView = view.id === viewId

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
                    hasSplitTicketView && splitTicketViewEnabled
                        ? `/app/views/${view.id}`
                        : `/app/tickets/${view.id}/${encodeURIComponent(
                              view.slug
                          )}`
                }
                onClick={() => dispatch(activeViewIdSet(view.id))}
            >
                <span className={classnames(navbarCss['item-name'], css.link)}>
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

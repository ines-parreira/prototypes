import type { ForwardedRef, RefObject } from 'react'
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react'

import {
    FeatureFlagKey,
    useFlag,
    useHelpdeskV2WayfindingMS1Flag,
} from '@repo/feature-flags'
import { addCanduLinkForValidViewOrSection } from '@repo/tickets/utils/views'
import classnames from 'classnames'
import { Link, useLocation } from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import { Navigation } from 'components/Navigation/Navigation'
import useAppDispatch from 'hooks/useAppDispatch'
import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import useViewId from 'hooks/useViewId'
import type { View } from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import { TicketNavbarViewLinkItem } from 'pages/tickets/navbar/TicketNavbarViewLinkItem'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { activeViewIdSet } from 'state/ui/views/actions'
import { isTicketPath } from 'utils'

import css from './TicketNavbarViewLink.less'

type Props = {
    className?: string
    icon?: string
    view: View
    viewCount?: number
    isNested?: boolean
}

const TicketNavbarViewLink = (
    { className, icon, view, viewCount, isNested }: Props,
    forwardedRef: ForwardedRef<HTMLDivElement>,
) => {
    const shouldRedirectDeprecatedTicketRoutes = useFlag<boolean>(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
        false,
    )
    const hasWayfindingMS1Flag = useHelpdeskV2WayfindingMS1Flag()

    const { isEnabled: splitTicketViewEnabled } = useSplitTicketView()
    const { pathname: path } = useLocation()

    const viewId = useViewId()
    const isTicketUrl = useMemo(() => isTicketPath(path), [path])

    const ref = useRef<HTMLDivElement>(null)
    useImperativeHandle(forwardedRef, () => ref.current!)

    const isActiveView = isTicketUrl && view.id === viewId

    const dispatch = useAppDispatch()
    const ticketNavbarId = `ticket-navbar-view-${view.id}`
    const canduId = addCanduLinkForValidViewOrSection('view', view)

    useScrollActiveItemIntoView(ref, isActiveView, true)

    const linkTo = useMemo(
        () =>
            shouldRedirectDeprecatedTicketRoutes
                ? `/app/tickets/${view.id}`
                : splitTicketViewEnabled
                  ? `/app/views/${view.id}`
                  : `/app/tickets/${view.id}/${encodeURIComponent(view.slug)}`,
        [shouldRedirectDeprecatedTicketRoutes, splitTicketViewEnabled, view],
    )

    if (hasWayfindingMS1Flag) {
        return (
            <TicketNavbarViewLinkItem
                ref={ref as unknown as RefObject<HTMLAnchorElement>}
                canduId={canduId}
                view={view}
                onClick={() => dispatch(activeViewIdSet(view.id))}
                viewCount={viewCount}
            />
        )
    }

    return (
        <div
            id={ticketNavbarId}
            ref={ref}
            {...(canduId ? { 'data-candu-id': canduId } : {})}
        >
            <Navigation.SectionItem
                as={Link}
                displayType={isNested ? 'indent' : 'default'}
                isSelected={isActiveView}
                onClick={() => dispatch(activeViewIdSet(view.id))}
                className={classnames(css.viewLink, className)}
                to={linkTo}
            >
                <span className={navbarCss['item-name']}>
                    {icon && (
                        <i
                            className={classnames(
                                'material-icons',
                                navbarCss.icon,
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
            </Navigation.SectionItem>
        </div>
    )
}

export default forwardRef<HTMLDivElement, Props>(TicketNavbarViewLink)

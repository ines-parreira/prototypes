import {
    ForwardedRef,
    forwardRef,
    useImperativeHandle,
    useMemo,
    useRef,
} from 'react'

import classnames from 'classnames'
import { Link, useLocation } from 'react-router-dom'

import navbarCss from 'assets/css/navbar.less'
import { Navigation } from 'components/Navigation/Navigation'
import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import useAppDispatch from 'hooks/useAppDispatch'
import useScrollActiveItemIntoView from 'hooks/useScrollActiveItemIntoView/useScrollActiveItemIntoView'
import useViewId from 'hooks/useViewId'
import { View } from 'models/view/types'
import ViewCount from 'pages/common/components/ViewCount/ViewCount'
import ViewName from 'pages/common/components/ViewName/ViewName'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { activeViewIdSet } from 'state/ui/views/actions'
import { isTicketPath } from 'utils'
import { addCanduLinkForValidViewOrSection } from 'utils/views'

import css from './TicketNavbarViewLinkV2.less'

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

    return (
        <Navigation.SectionItem
            {...(canduId ? { 'data-candu-id': canduId } : {})}
            as={Link}
            id={ticketNavbarId}
            ref={ref}
            displayType={isNested ? 'indent' : 'default'}
            isSelected={isActiveView}
            onClick={() => dispatch(activeViewIdSet(view.id))}
            className={classnames(css.viewLink, className)}
            to={linkTo}
        >
            <span className={navbarCss['item-name']}>
                {icon && (
                    <i className={classnames('material-icons', navbarCss.icon)}>
                        {icon}
                    </i>
                )}
                <ViewName viewName={view.name} emoji={view.decoration?.emoji} />
            </span>
            <span className={navbarCss['item-count']}>
                <ViewCount
                    viewId={view.id}
                    viewCount={viewCount}
                    isDeactivated={!!view.deactivated_datetime}
                />
            </span>
        </Navigation.SectionItem>
    )
}

export default forwardRef<HTMLDivElement, Props>(TicketNavbarViewLink)

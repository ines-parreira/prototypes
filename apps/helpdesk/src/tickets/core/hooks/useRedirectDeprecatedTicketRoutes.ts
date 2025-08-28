import { useEffect, useMemo } from 'react'

import { FeatureFlagKey } from '@repo/feature-flags'
import { useHistory, useLocation } from 'react-router-dom'

import { useFlag } from 'core/flags'
import useAppSelector from 'hooks/useAppSelector'
import { ViewType } from 'models/view/types'
import { getActiveView } from 'state/views/selectors'

export default function useRedirectDeprecatedTicketRoutes() {
    const shouldRedirectDeprecatedTicketRoutes = useFlag<boolean>(
        FeatureFlagKey.RedirectDeprecatedTicketRoutes,
        false,
    )

    const history = useHistory()
    const location = useLocation()

    const activeView = useAppSelector(getActiveView)
    const activeViewId = useMemo(
        () => activeView.get('id') as number | undefined,
        [activeView],
    )
    const activeViewType = useMemo(
        () => activeView.get('type') as ViewType | undefined,
        [activeView],
    )

    useEffect(() => {
        if (!shouldRedirectDeprecatedTicketRoutes) return

        const { pathname: path } = location

        // don't redirect these `edit-widgets` and `print` urls for the time being
        let m = path.match(/^\/app\/ticket\/\d+\/(?:edit-widgets|print)$/)
        if (m) {
            return
        }

        // don't redirect new ticket page
        m = path.match(/^\/app\/ticket\/new\/?/)
        if (m) {
            return
        }

        m = path.match(/^\/app\/?$/)
        if (m) {
            history.replace('/app/tickets')
            return
        }

        m = path.match(/^\/app\/ticket\/(\d+)/)
        if (m) {
            const viewId =
                activeViewType === ViewType.TicketList && activeViewId
                    ? activeViewId
                    : 0
            history.replace(`/app/tickets/${viewId}/${m[1]}`)
            return
        }

        m = path.match(/^\/app\/tickets\/(\d+)\/(.+)\/?/)
        if (m && !m[2].match(/^\d+$/)) {
            history.replace(`/app/tickets/${m[1]}`)
            return
        }

        m = path.match(/^\/app\/views\/?(?:(\d+)\/?(?:(\d+)\/?)?)?/)
        if (m) {
            const [, viewId, ticketId] = m
            let newPath = `/app/tickets`
            if (viewId) {
                newPath += `/${viewId}`
            }
            if (ticketId) {
                newPath += `/${ticketId}`
            }

            history.replace(newPath)
            return
        }
    }, [
        activeViewId,
        activeViewType,
        history,
        location,
        shouldRedirectDeprecatedTicketRoutes,
    ])
}

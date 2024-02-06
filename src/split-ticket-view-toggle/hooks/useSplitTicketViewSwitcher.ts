import {useFlags} from 'launchdarkly-react-client-sdk'
import {useEffect, useMemo} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import {getActiveView} from 'state/views/selectors'

import useSplitTicketView from './useSplitTicketView'

export default function useSplitTicketViewSwitcher() {
    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]

    const history = useHistory()
    const {pathname: path} = useLocation()
    const [enabled] = useSplitTicketView()
    const activeView = useAppSelector(getActiveView)

    const activeViewId = useMemo(
        () => activeView.get('id') as number,
        [activeView]
    )

    const {ticketId, viewId} = useParams<{ticketId?: string; viewId?: string}>()

    useEffect(() => {
        if (!hasSplitTicketView) {
            return
        }

        if (!enabled) {
            if (ticketId) {
                history.push(`/app/ticket/${ticketId}`)
                return
            }

            if (viewId) {
                history.push(`/app/tickets/${viewId}`)
                return
            }

            if (path.match(/^\/app\/views\/?$/)) {
                history.push('/app')
                return
            }

            return
        }

        if (ticketId) {
            if (activeViewId) {
                history.push(`/app/views/${activeViewId}/${ticketId}`)
            }
            return
        }

        if (viewId) {
            history.push(`/app/views/${viewId}`)
            return
        }

        if (path.match(/^\/app\/?$/)) {
            history.push('/app/views')
        }
    }, [
        activeViewId,
        enabled,
        hasSplitTicketView,
        history,
        path,
        ticketId,
        viewId,
    ])
}

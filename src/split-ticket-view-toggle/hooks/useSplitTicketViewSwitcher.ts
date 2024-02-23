import {useFlags} from 'launchdarkly-react-client-sdk'
import {useEffect, useMemo, useRef} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import {FeatureFlagKey} from 'config/featureFlags'
import useAppSelector from 'hooks/useAppSelector'
import usePrevious from 'hooks/usePrevious'
import {getActiveView} from 'state/views/selectors'
import {isStrictTicketPath} from 'utils'

import useSplitTicketView from './useSplitTicketView'

export default function useSplitTicketViewSwitcher() {
    const hasSplitTicketView: boolean | undefined =
        useFlags()[FeatureFlagKey.SplitTicketView]

    const history = useHistory()
    const {pathname: path} = useLocation()
    const previousPath = usePrevious(path)
    const {isEnabled} = useSplitTicketView()
    const activeView = useAppSelector(getActiveView)
    const isMobileResolution = useIsMobileResolution()
    const isSplitTicketViewEnabled = useMemo(
        () => isEnabled && !isMobileResolution,
        [isEnabled, isMobileResolution]
    )
    const previousIsSplitTicketViewEnabled = useRef<boolean | undefined>(
        undefined
    )

    const activeViewId = useMemo(
        () => activeView.get('id') as number,
        [activeView]
    )

    const {ticketId, viewId} = useParams<{ticketId?: string; viewId?: string}>()

    useEffect(() => {
        if (!hasSplitTicketView) {
            return
        }

        if (
            isSplitTicketViewEnabled ===
                previousIsSplitTicketViewEnabled.current &&
            (!!previousPath ? isStrictTicketPath(previousPath) : true)
        ) {
            return
        }

        previousIsSplitTicketViewEnabled.current = isSplitTicketViewEnabled

        if (!isSplitTicketViewEnabled) {
            if (ticketId) {
                history.replace(`/app/ticket/${ticketId}`)
                return
            }

            if (viewId) {
                history.replace(`/app/tickets/${viewId}`)
                return
            }

            if (path.match(/^\/app\/views\/?$/)) {
                history.replace('/app')
                return
            }

            return
        }

        if (path.match(/^\/app\/ticket\/\d+\/edit-widgets$/)) {
            return
        }

        if (ticketId) {
            if (activeViewId) {
                history.replace(`/app/views/${activeViewId}/${ticketId}`)
            }
            return
        }

        if (viewId) {
            history.replace(`/app/views/${viewId}`)
            return
        }

        if (path.match(/^\/app(?:\/tickets)?$/)) {
            history.replace('/app/views')
        }
    }, [
        activeViewId,
        isSplitTicketViewEnabled,
        previousIsSplitTicketViewEnabled,
        hasSplitTicketView,
        history,
        path,
        ticketId,
        viewId,
        previousPath,
    ])
}

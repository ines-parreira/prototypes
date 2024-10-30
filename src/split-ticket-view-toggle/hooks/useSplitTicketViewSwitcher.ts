import {useEffect, useMemo, useRef} from 'react'
import {useHistory, useLocation, useParams} from 'react-router-dom'

import useAppSelector from 'hooks/useAppSelector'
import useIsMobileResolution from 'hooks/useIsMobileResolution/useIsMobileResolution'
import usePrevious from 'hooks/usePrevious'
import {ViewType} from 'models/view/types'
import {getActiveView} from 'state/views/selectors'
import {isStrictTicketPath} from 'utils'

import useSplitTicketView from './useSplitTicketView'

interface LocationState {
    skipRedirect?: boolean
}

export default function useSplitTicketViewSwitcher() {
    const history = useHistory()
    const {
        pathname: path,
        search: params,
        state: locationState,
    } = useLocation<LocationState>()
    const previousPath = usePrevious(path)
    const {isEnabled, shouldRedirectToSplitView} = useSplitTicketView()
    const activeView = useAppSelector(getActiveView)
    const isMobileResolution = useIsMobileResolution()
    const isSplitTicketViewEnabled = useMemo(
        () => isEnabled && !isMobileResolution,
        [isEnabled, isMobileResolution]
    )
    const previousIsSplitTicketViewEnabled = useRef<boolean | undefined>(
        undefined
    )

    const shouldSkipRedirect = locationState?.skipRedirect

    const activeViewId = useMemo(
        () => activeView.get('id') as number | undefined,
        [activeView]
    )

    const activeViewType = useMemo(
        () => activeView.get('type') as ViewType | undefined,
        [activeView]
    )

    const {ticketId, viewId} = useParams<{ticketId?: string; viewId?: string}>()

    useEffect(() => {
        if (
            isSplitTicketViewEnabled ===
                previousIsSplitTicketViewEnabled.current &&
            (!!previousPath ? isStrictTicketPath(previousPath) : true)
        ) {
            return
        }

        previousIsSplitTicketViewEnabled.current = isSplitTicketViewEnabled

        if (path.match(/^\/app\/ticket\/\d+\/edit-widgets$/)) {
            return
        }

        if (!isSplitTicketViewEnabled) {
            if (!shouldRedirectToSplitView && ticketId && ticketId !== 'new') {
                history.replace(`/app/ticket/${ticketId}`)
                return
            }

            if (viewId && viewId !== 'new' && viewId !== 'search') {
                history.replace(`/app/tickets/${viewId}`)
                return
            }

            if (path.match(/^\/app\/views\/?$/)) {
                history.replace('/app' + params)
                return
            }

            return
        }

        if (ticketId) {
            if (
                activeViewId &&
                activeViewType === ViewType.TicketList &&
                ticketId !== 'new'
            ) {
                history.replace(`/app/views/${activeViewId}/${ticketId}`)
            }
            return
        }

        if (viewId && !shouldSkipRedirect) {
            history.replace(
                `/app/views/${
                    activeViewId && activeViewId.toString() !== viewId
                        ? activeViewId
                        : viewId
                }`
            )
            return
        }

        if (path.match(/^\/app(?:\/tickets)?$/)) {
            history.replace('/app/views' + params)
        }
    }, [
        activeViewId,
        activeViewType,
        isSplitTicketViewEnabled,
        previousIsSplitTicketViewEnabled,
        history,
        path,
        ticketId,
        viewId,
        previousPath,
        shouldRedirectToSplitView,
        params,
        shouldSkipRedirect,
    ])
}

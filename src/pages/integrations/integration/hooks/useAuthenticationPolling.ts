import {Map} from 'immutable'
import {useEffect, useRef} from 'react'

import {useHistory} from 'react-router-dom'

import {PENDING_AUTHENTICATION_STATUS} from 'constants/integration'
import useAppDispatch from 'hooks/useAppDispatch'

import {IntegrationType} from 'models/integration/constants'
import {
    fetchIntegration,
    triggerCreateSuccess,
} from 'state/integrations/actions'

const REFRESH_DELAY = 3000

// Ping the integration until the authentication process is done
export default function useAuthenticationPolling(
    integration: Map<string, unknown>
) {
    const isAuthenticationPending =
        integration.getIn(['meta', 'oauth', 'status']) ===
        PENDING_AUTHENTICATION_STATUS
    const history = useHistory()
    const dispatch = useAppDispatch()
    const refTimer = useRef<ReturnType<typeof setTimeout> | undefined>()

    useEffect(() => {
        const search = new URLSearchParams(history.location.search)

        if (typeof integration.get('id') === 'undefined') return
        if (search.get('action') !== 'authentication') return

        const timer = refTimer.current
        if (timer) clearTimeout(timer)
        if (isAuthenticationPending) {
            refTimer.current = setTimeout(() => {
                void dispatch(
                    fetchIntegration(
                        integration.get('id') as string,
                        integration.get('type') as IntegrationType,
                        true
                    )
                )
            }, REFRESH_DELAY)
        } else {
            // make sure to delete the action search param to stop the effect
            search.delete('action')
            history.replace({
                pathname: history.location.pathname,
                search: search.toString(),
            })
            dispatch(triggerCreateSuccess(integration.toJS()))
        }
    }, [dispatch, integration, history, isAuthenticationPending])

    return isAuthenticationPending
}

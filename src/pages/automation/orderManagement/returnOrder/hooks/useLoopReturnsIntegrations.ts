import {useMemo} from 'react'

import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import {HttpIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

import {LOOP_RETURNS_API_URL} from '../constants'

const useLoopReturnsIntegrations = () => {
    const getHttpIntegrations = useMemo(
        () => getIntegrationsByType<HttpIntegration>(IntegrationType.Http),
        []
    )
    const httpIntegrations = useAppSelector(getHttpIntegrations)

    return useMemo(
        () =>
            httpIntegrations.filter((integration) =>
                integration.http?.url?.startsWith(LOOP_RETURNS_API_URL)
            ),
        [httpIntegrations]
    )
}

export default useLoopReturnsIntegrations

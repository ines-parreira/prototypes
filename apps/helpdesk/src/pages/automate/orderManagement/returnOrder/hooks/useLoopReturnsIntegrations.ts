import { useMemo } from 'react'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import type { HttpIntegration } from 'models/integration/types'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { LOOP_RETURNS_API_URL } from '../constants'

const useLoopReturnsIntegrations = () => {
    const getHttpIntegrations = useMemo(
        () => getIntegrationsByType<HttpIntegration>(IntegrationType.Http),
        [],
    )
    const httpIntegrations = useAppSelector(getHttpIntegrations)

    return useMemo(
        () =>
            httpIntegrations.filter((integration) =>
                integration.http?.url?.startsWith(LOOP_RETURNS_API_URL),
            ),
        [httpIntegrations],
    )
}

export default useLoopReturnsIntegrations

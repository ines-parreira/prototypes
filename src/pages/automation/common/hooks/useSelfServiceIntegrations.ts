import {useMemo} from 'react'
import {getIntegrationsByType} from 'state/integrations/selectors'
import {IntegrationType, SelfServiceIntegration} from 'models/integration/types'
import useAppSelector from 'hooks/useAppSelector'

const useSelfServiceIntegrations = () => {
    const getSelfServiceIntegrations = useMemo(
        () =>
            getIntegrationsByType<SelfServiceIntegration>(
                IntegrationType.SelfService
            ),
        []
    )

    return useAppSelector(getSelfServiceIntegrations)
}

export default useSelfServiceIntegrations

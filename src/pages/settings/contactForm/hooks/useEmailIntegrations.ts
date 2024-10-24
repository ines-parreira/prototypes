import {useMemo} from 'react'

import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'
import {
    isGenericEmailIntegration,
    isBaseEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import * as integrationsSelectors from 'state/integrations/selectors'

const emailIntegrationsSelector = integrationsSelectors.getIntegrationsByTypes(
    EMAIL_INTEGRATION_TYPES
)

export function useEmailIntegrations() {
    const integrations = useAppSelector(emailIntegrationsSelector)
    const emailIntegrations = useMemo(
        () => integrations.filter(isGenericEmailIntegration),
        [integrations]
    )
    const defaultIntegration = useMemo(
        () => emailIntegrations.find(isBaseEmailIntegration),
        [emailIntegrations]
    )

    return {
        emailIntegrations,
        defaultIntegration,
    }
}

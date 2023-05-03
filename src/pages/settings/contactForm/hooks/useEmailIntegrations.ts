import {
    isGenericEmailIntegration,
    isBaseEmailIntegration,
} from 'pages/integrations/integration/components/email/helpers'
import * as integrationsSelectors from 'state/integrations/selectors'
import {EMAIL_INTEGRATION_TYPES} from 'constants/integration'
import useAppSelector from 'hooks/useAppSelector'

const emailIntegrationsSelector = integrationsSelectors.getIntegrationsByTypes(
    EMAIL_INTEGRATION_TYPES
)

export function useEmailIntegrations() {
    const integrations = useAppSelector(emailIntegrationsSelector)
    const emailIntegrations = integrations.filter(isGenericEmailIntegration)
    const defaultIntegration = emailIntegrations.find(isBaseEmailIntegration)

    return {
        emailIntegrations,
        defaultIntegration,
    }
}

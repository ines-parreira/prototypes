import { Redirect } from 'react-router-dom'

import StoreIntegrationView from 'pages/automate/common/components/StoreIntegrationView'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

export function AutomateSettings() {
    const integrations = useStoreIntegrations()

    if (integrations.length === 0) {
        return <StoreIntegrationView title="Automate" />
    }

    return <Redirect to="flows" />
}

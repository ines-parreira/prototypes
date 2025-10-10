import { LegacyButton as Button } from '@gorgias/axiom'

import { IntegrationType } from 'models/integration/constants'
import RootDetails from 'pages/common/components/ProductDetail'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import { mapAppToDetail } from 'pages/integrations/mappers/appToDetail'
import { getIntegrationConfig } from 'state/integrations/helpers'

import { BASE_PATH, NEW_INTEGRATION_PATH } from '../constants'

const httpConfig = getIntegrationConfig(IntegrationType.Http)

function Details() {
    if (!httpConfig) return null

    const detailProps = mapAppToDetail(httpConfig)
    detailProps.infocard.CTA = (
        <ConnectLink
            connectUrl={`${BASE_PATH}/${NEW_INTEGRATION_PATH}`}
            integrationTitle={httpConfig.title}
        >
            <Button>Add {httpConfig.title}</Button>
        </ConnectLink>
    )

    return <RootDetails {...detailProps} />
}

export default Details

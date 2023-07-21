import React from 'react'

import {getIntegrationConfig} from 'state/integrations/helpers'
import RootDetails from 'pages/common/components/ProductDetail'
import {mapAppToDetail} from 'pages/integrations/mappers/appToDetail'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import Button from 'pages/common/components/button/Button'
import {IntegrationType} from 'models/integration/constants'
import {BASE_PATH, NEW_INTEGRATION_PATH} from '../constants'

const httpConfig = getIntegrationConfig(IntegrationType.Http)

function Details() {
    if (!httpConfig) return null

    const connectProps = {
        connectUrl: `${BASE_PATH}/${NEW_INTEGRATION_PATH}`,
        isExternalConnectUrl: false,
    }

    const detailProps = mapAppToDetail(httpConfig)
    const CTA = (
        <ConnectLink
            connectUrl={connectProps.connectUrl}
            integrationTitle={httpConfig.title}
        >
            <Button>Add {httpConfig.title}</Button>
        </ConnectLink>
    )
    detailProps.infocard.CTA = CTA

    return <RootDetails {...detailProps} />
}

export default Details

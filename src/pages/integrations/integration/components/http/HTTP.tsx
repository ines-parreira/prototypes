import React from 'react'

import {IntegrationType} from 'models/integration/constants'
import Button from 'pages/common/components/button/Button'
import PageHeader from 'pages/common/components/PageHeader'
import ConnectLink from 'pages/integrations/components/ConnectLink'
import {getIntegrationConfig} from 'state/integrations/helpers'

import Breadcrumb from './Breadcrumb'
import {BASE_PATH, NEW_INTEGRATION_PATH} from './constants'
import Event from './Event'
import Events from './Events'
import Integration from './Integration'
import Details from './Overview/Details'
import List from './Overview/List'
import SecondaryNavigation from './SecondaryNavigation'
import {useRouteParser} from './useRouteParser'

function Http() {
    const {
        isDetail,
        isList,
        integrationId,
        isIntegration,
        isNewIntegration,
        integration,
        isEvents,
        isEvent,
        eventId,
    } = useRouteParser()

    const httpConfig = getIntegrationConfig(IntegrationType.Http)
    if (!httpConfig) return null

    return (
        <div className="full-width">
            <PageHeader title={<Breadcrumb />}>
                {isList && (
                    <ConnectLink
                        connectUrl={`${BASE_PATH}/${NEW_INTEGRATION_PATH}`}
                        integrationTitle={httpConfig.title}
                    >
                        <Button>Add {httpConfig.title}</Button>
                    </ConnectLink>
                )}
            </PageHeader>
            <SecondaryNavigation />
            {isDetail && <Details />}
            {isList && <List />}
            {isIntegration && (
                <Integration
                    integration={integration}
                    isUpdate={!isNewIntegration}
                />
            )}
            {isEvents && <Events integrationId={integrationId} />}
            {isEvent && (
                <Event
                    integrationId={Number(integrationId)}
                    eventId={Number(eventId)}
                />
            )}
        </div>
    )
}

export default Http

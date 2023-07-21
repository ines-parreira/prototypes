import React from 'react'

import PageHeader from 'pages/common/components/PageHeader'

import List from './Overview/List'
import Details from './Overview/Details'
import Integration from './Integration'
import Events from './Events'
import Event from './Event'
import Breadcrumb from './Breadcrumb'
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

    return (
        <div className="full-width">
            <PageHeader title={<Breadcrumb />} />
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

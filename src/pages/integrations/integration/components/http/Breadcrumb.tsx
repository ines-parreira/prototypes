import React from 'react'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem} from 'reactstrap'

import {IntegrationType} from 'models/integration/constants'
import {getIntegrationConfig} from 'state/integrations/helpers'

import {BASE_PATH, EVENTS_PATH, INTEGRATIONS_LIST_PATH} from './constants'
import {useRouteParser} from './useRouteParser'

const httpConfig = getIntegrationConfig(IntegrationType.Http)

export default function Breadcrumbs() {
    const {
        isDetail,
        isList,
        isNewIntegration,
        integrationId,
        integration,
        isEvents,
        isEvent,
        eventId,
    } = useRouteParser()

    return (
        <Breadcrumb>
            <BreadcrumbItem>
                {isDetail || isList ? (
                    httpConfig?.title
                ) : (
                    <Link
                        to={`${BASE_PATH}${
                            integrationId && !isNewIntegration
                                ? `/${INTEGRATIONS_LIST_PATH}`
                                : ''
                        }`}
                    >
                        {httpConfig?.title}
                    </Link>
                )}
            </BreadcrumbItem>
            {integration && (
                <>
                    <BreadcrumbItem active={!isEvent}>
                        {isEvents || isEvent ? (
                            <Link to={`${BASE_PATH}/${integrationId}`}>
                                {integration.name}
                            </Link>
                        ) : (
                            integration.name
                        )}
                    </BreadcrumbItem>
                </>
            )}
            {isNewIntegration && (
                <BreadcrumbItem active>
                    Add a new HTTP integration
                </BreadcrumbItem>
            )}
            {(isEvents || isEvent) && (
                <BreadcrumbItem active={!isEvent}>
                    {isEvent ? (
                        <Link
                            to={`${BASE_PATH}/${integrationId}/${EVENTS_PATH}`}
                        >
                            Events
                        </Link>
                    ) : (
                        'Events'
                    )}
                </BreadcrumbItem>
            )}
            {isEvent && <BreadcrumbItem active>#{eventId}</BreadcrumbItem>}
        </Breadcrumb>
    )
}

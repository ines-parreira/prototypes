import React from 'react'
import {Link} from 'react-router-dom'
import {Map} from 'immutable'

import {Breadcrumb, BreadcrumbItem, Container, Alert, Button} from 'reactstrap'

import PageHeader from '../../../../common/components/PageHeader'

import history from '../../../../history'

import ChatIntegrationNavigation from './GorgiasChatIntegrationNavigation.js'

type OwnProps = {
    integration: Map<any, any>
}

export function GorgiasChatIntegrationSelfServiceComponent({
    integration,
}: OwnProps) {
    const integrationType: string = integration.get('type')

    return (
        <div className="full-width">
            <PageHeader
                title={
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">
                                Integrations
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link
                                to={`/app/settings/integrations/${integrationType}`}
                            >
                                Chat
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integration.get('name')}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>Self-service</BreadcrumbItem>
                    </Breadcrumb>
                }
            />

            <ChatIntegrationNavigation integration={integration} />

            <Container fluid className="page-container">
                <Alert color="warning">
                    <span role="img" aria-label="warning">
                        ⚠️
                    </span>{' '}
                    Product Update: the Self-service features have moved to{' '}
                    <Link to="/app/settings/self-service">
                        a new settings page
                    </Link>
                </Alert>
                We're moving the Self-service settings outside of the chat
                integrations' settings page for better visibility and clarity.
                Access the Self-service settings by clicking the "Self-service"
                menu item in the settings sidebar. Self-service features will be
                specific to each connected Shopify store and available in
                different channels.
                <br />
                <br />
                Read more about it{' '}
                <a
                    href="https://docs.gorgias.com/self-service/installing-and-using-the-self-service-chat-portal"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    here
                </a>{' '}
                and don't hesitate to reach-out for questions.
                <br />
                <br />
                <Button
                    type="button"
                    onClick={() => {
                        history.push('/app/settings/self-service')
                    }}
                    color="success"
                >
                    Go to the new Self-service page
                </Button>
            </Container>
        </div>
    )
}

export default GorgiasChatIntegrationSelfServiceComponent

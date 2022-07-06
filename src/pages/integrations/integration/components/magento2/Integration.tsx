import React from 'react'
import {Map} from 'immutable'
import {Col, Container, Row} from 'reactstrap'

import Loader from 'pages/common/components/Loader/Loader'
import Alert, {AlertType} from 'pages/common/components/Alert/Alert'
import settingsCss from 'pages/settings/settings.less'
import LinkAlert from 'pages/common/components/Alert/LinkAlert'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'
import useAuthenticationPolling from 'pages/integrations/integration/hooks/useAuthenticationPolling'

import ManualIntegrationForm from './ManualIntegrationForm'
import OneClickIntegrationForm from './OneClickIntegrationForm'

type Props = {
    integration: Map<any, any>
    loading: Map<any, any>
    redirectUri: string
}

function Integration({integration, loading, redirectUri}: Props) {
    const isSubmitting = !!loading.get('updateIntegration')
    const isManual = integration.getIn(['meta', 'is_manual'], false)
    const isSyncOver = integration.getIn(['meta', 'import_state', 'is_over'])

    useQueryNotify()
    useAuthenticationPolling(integration)

    if (loading.get('integration')) {
        return <Loader />
    }

    return (
        <Container fluid className={settingsCss.pageContainer}>
            <Row>
                <Col md="8">
                    {isSyncOver ? (
                        <LinkAlert
                            className="mb-4"
                            actionLabel="Review your customers."
                            actionHref="/app/customers"
                        >
                            All your Magento2 customers have been imported. You
                            can now see their info in the sidebar.
                        </LinkAlert>
                    ) : (
                        <Alert className="mb-4" type={AlertType.Loading} icon>
                            Import in progress. We typically sync 3,000
                            customers an hour.We will send you an email once it
                            is done. Feel free to leave this page.
                        </Alert>
                    )}

                    {isManual ? (
                        <ManualIntegrationForm
                            integration={integration}
                            isUpdate
                            isSubmitting={isSubmitting}
                        />
                    ) : (
                        <OneClickIntegrationForm
                            integration={integration}
                            isUpdate
                            isSubmitting={isSubmitting}
                            redirectUri={redirectUri}
                        />
                    )}
                </Col>
            </Row>
        </Container>
    )
}

export default Integration

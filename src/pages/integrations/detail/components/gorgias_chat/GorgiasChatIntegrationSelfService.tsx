import React, {useState, useEffect, useCallback} from 'react'
import {Link} from 'react-router'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import classnames from 'classnames'

import PageHeader from '../../../../common/components/PageHeader'
import {updateOrCreateIntegration} from '../../../../../state/integrations/actions'
import ToggleButton from '../../../../common/components/ToggleButton.js'
import {getIconFromUrl} from '../../../../../state/integrations/helpers'

import ChatIntegrationNavigation from './GorgiasChatIntegrationNavigation.js'

type OwnProps = {
    integration: Map<any, any>
}

const selfServiceMock = getIconFromUrl('integrations/self_service_mock.png')

export function GorgiasChatIntegrationSelfServiceComponent({
    updateOrCreateIntegration,
    integration,
}: OwnProps & ConnectedProps<typeof connector>) {
    const [selfServiceEnabled, setSelfServiceEnabled] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)

    const initState = () => {
        const selfServiceState =
            integration.getIn(['meta', 'self_service', 'enabled']) ||
            fromJS(false)

        setSelfServiceEnabled(selfServiceState)
        setIsUpdating(false)
        setIsInitialized(true)
    }

    useEffect(() => {
        if (!integration.isEmpty() && !isInitialized) {
            initState()
        }
    }, [initState, integration, isInitialized])

    const onToggleSelfService = useCallback(async () => {
        const selfServiceEnabledAfterToggle = !selfServiceEnabled

        setIsUpdating(true)
        setSelfServiceEnabled(selfServiceEnabledAfterToggle)

        const existingMeta: Map<any, any> =
            integration.get('meta') || fromJS({})
        const payload: Map<any, any> = fromJS({
            id: integration.get('id'),
            meta: existingMeta.set(
                'self_service',
                fromJS({
                    enabled: selfServiceEnabledAfterToggle,
                })
            ),
        })

        try {
            await updateOrCreateIntegration(payload)
        } finally {
            setIsUpdating(false)
        }
    }, [selfServiceEnabled, selfServiceEnabled, integration])

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
                <Row>
                    <Col>
                        <div className="mb-4">
                            <h4>Self-service</h4>
                            <p>
                                Most e-commerce support requests are about the
                                same 20 types of issues.
                                <br />
                                <br />
                                Self-service enables your customers to browse
                                their orders and select the type of issue they
                                are having. It will create a chat ticket for
                                your team to handle.
                            </p>

                            <div className="mb-3">
                                <ToggleButton
                                    className={classnames({
                                        'btn-loading': isUpdating,
                                    })}
                                    disabled={isUpdating}
                                    label="Enable Self-service"
                                    name="selfServiceEnabled"
                                    onChange={onToggleSelfService}
                                    value={selfServiceEnabled}
                                />
                            </div>
                        </div>
                    </Col>

                    <Col>
                        <img src={selfServiceMock} alt="Self-service Mock" />
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const connector = connect(null, {
    updateOrCreateIntegration,
})

export default connector(GorgiasChatIntegrationSelfServiceComponent)

import React, {Component} from 'react'
import {connect, ConnectedProps} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {notify} from '../../../../../../state/notifications/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import CustomInstallationCard from '../../../../common/CustomInstallationCard/CustomInstallationCard'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'
import {makeGetIntegrationsByTypes} from '../../../../../../state/integrations/selectors'
import InstallOnIntegrationsCard from '../../../../common/InstallOnIntegrationsCard/InstallOnIntegrationsCard'
import {IntegrationType} from '../../../../../../models/integration/types'
import {RootState} from '../../../../../../state/types'
import {updateOrCreateIntegration} from '../../../../../../state/integrations/actions'

import {renderChatCodeSnippet} from './utils.js'

const targetIntegrationsType = fromJS([
    IntegrationType.ShopifyIntegrationType,
]) as List<any>

type Props = {
    integration: Map<any, any>
} & ConnectedProps<typeof connector>

type State = {
    name: string
    email: string
    integrationLoading: boolean | null
}

export class ChatIntegrationInstallContainer extends Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
    }

    render() {
        const {
            integration,
            getIntegrationsByTypes,
            updateOrCreateIntegration,
        } = this.props

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
                                <Link to="/app/settings/integrations/smooch_inside">
                                    Chat (Deprecated)
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <ChatIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <Row>
                        <Col md="8">
                            {targetIntegrationsType.map(
                                (targetIntegrationType) => {
                                    return (
                                        <InstallOnIntegrationsCard
                                            key={targetIntegrationType}
                                            integrationType={
                                                targetIntegrationType
                                            }
                                            targetIntegrations={getIntegrationsByTypes(
                                                targetIntegrationType
                                            )}
                                            integration={integration}
                                            updateOrCreateIntegration={
                                                updateOrCreateIntegration
                                            }
                                        />
                                    )
                                }
                            )}

                            <CustomInstallationCard
                                integrationType={integration.get('type')}
                                description={
                                    <p>
                                        Copy the code below and paste it on your
                                        website above the <b>{'</body>'}</b>{' '}
                                        tag:
                                    </p>
                                }
                                code={renderChatCodeSnippet(integration)}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

const connector = connect(
    (state: RootState) => ({
        domain: state.currentAccount.get('domain'),
        getIntegrationsByTypes: makeGetIntegrationsByTypes(state),
    }),
    {
        updateOrCreateIntegration,
        notify,
    }
)

export default connector(ChatIntegrationInstallContainer)

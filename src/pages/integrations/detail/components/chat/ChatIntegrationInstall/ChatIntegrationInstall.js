// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../constants/integration'

import {notify} from '../../../../../../state/notifications/actions'
import PageHeader from '../../../../../common/components/PageHeader'
import CustomInstallationCard from '../../../../common/CustomInstallationCard/CustomInstallationCard'
import ChatIntegrationNavigation from '../ChatIntegrationNavigation'

import * as integrationSelectors from '../../../../../../state/integrations/selectors.ts'
import InstallOnIntegrationsCard from '../../../../common/InstallOnIntegrationsCard'

import {renderChatCodeSnippet} from './utils'

const targetIntegrationsType = fromJS([SHOPIFY_INTEGRATION_TYPE])

type Props = {
    domain: string,
    actions: Object,
    notify: ({}) => void,
    getIntegrationsByTypes: (string) => List<Map<*, *>>,
    integration: Map<*, *>,
}

type State = {
    name: string,
    email: string,
    integrationLoading: boolean | null,
}

class ChatIntegrationInstall extends React.Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
    }

    render() {
        const {integration, getIntegrationsByTypes, actions} = this.props

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
                                    Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Installation</BreadcrumbItem>
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
                                                actions.updateOrCreateIntegration
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

const mapStateToProps = (state) => {
    return {
        domain: state.currentAccount.get('domain'),
        getIntegrationsByTypes: integrationSelectors.makeGetIntegrationsByTypes(
            state
        ),
    }
}

export default connect(mapStateToProps, {notify})(ChatIntegrationInstall)

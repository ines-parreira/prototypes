// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {
    GORGIAS_CHAT_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
} from '../../../../../constants/integration.ts'

import {notify} from '../../../../../state/notifications/actions.ts'
import * as integrationSelectors from '../../../../../state/integrations/selectors.ts'
import PageHeader from '../../../../common/components/PageHeader'
import CustomInstallationCard from '../../../common/CustomInstallationCard/CustomInstallationCard'
import InstallOnIntegrationsCard from '../../../common/InstallOnIntegrationsCard'

import {renderChatCodeSnippet} from './renderChatCodeSnippet'
import GorgiasChatIntegrationNavigation from './GorgiasChatIntegrationNavigation'

const targetIntegrationsType = fromJS([SHOPIFY_INTEGRATION_TYPE])

type Props = {
    domain: string,
    actions: Object,
    notify: ({}) => void,
    getIntegrationsByTypes: (string) => List<Map<*, *>>,
    integration: Map<*, *>,
    gorgiasChatExtraState: Map<*, *>,
}

type State = {
    name: string,
    email: string,
    integrationLoading: boolean | null,
}

class GorgiasChatIntegrationInstall extends React.Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
    }

    render() {
        const {
            integration,
            getIntegrationsByTypes,
            actions,
            gorgiasChatExtraState,
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
                                <Link
                                    to={`/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}`}
                                >
                                    Gorgias Chat
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.get('name')}
                            </BreadcrumbItem>
                            <BreadcrumbItem active>Installation</BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <GorgiasChatIntegrationNavigation integration={integration} />

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
                                code={renderChatCodeSnippet({
                                    chatAppId: integration.getIn([
                                        'meta',
                                        'app_id',
                                    ]),
                                    gorgiasChatExtraState: gorgiasChatExtraState,
                                })}
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
        gorgiasChatExtraState: integrationSelectors.getIntegrationTypeExtraState(
            GORGIAS_CHAT_INTEGRATION_TYPE
        )(state),
    }
}

export default connect(mapStateToProps, {notify})(GorgiasChatIntegrationInstall)

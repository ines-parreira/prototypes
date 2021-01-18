// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import {Link} from 'react-router-dom'
import {Breadcrumb, BreadcrumbItem, Col, Container, Row} from 'reactstrap'

import {SHOPIFY_INTEGRATION_TYPE} from '../../../../../../constants/integration.ts'

import {notify} from '../../../../../../state/notifications/actions.ts'
import PageHeader from '../../../../../common/components/PageHeader.tsx'

import * as integrationSelectors from '../../../../../../state/integrations/selectors.ts'
import CustomInstallationCard from '../../../../common/CustomInstallationCard/CustomInstallationCard'
import FacebookIntegrationNavigation from '../FacebookIntegrationNavigation'
import InstallOnIntegrationsCard from '../../../../common/InstallOnIntegrationsCard'

import {renderFacebookCodeSnippet} from './utils'
import css from './FacebookIntegrationCustomerChat.less'

const targetIntegrationTypes = fromJS([SHOPIFY_INTEGRATION_TYPE])

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
    integrationLoading: ?boolean,
}

class FacebookIntegrationCustomerChat extends React.Component<Props, State> {
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
                                <Link to="/app/settings/integrations/facebook">
                                    Facebook, Messenger & Instagram
                                </Link>
                            </BreadcrumbItem>
                            <BreadcrumbItem>
                                {integration.getIn(['meta', 'name'])}
                            </BreadcrumbItem>
                            <BreadcrumbItem active>
                                Customer chat
                            </BreadcrumbItem>
                        </Breadcrumb>
                    }
                />

                <FacebookIntegrationNavigation integration={integration} />

                <Container fluid className="page-container">
                    <Row>
                        <Col md="6">
                            {targetIntegrationTypes.map(
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
                                        To install the Messenger widget on your
                                        website manually, you first need to
                                        whitelist your website's domain for your
                                        Facebook page on Facebook. You can do so{' '}
                                        <a
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={`https://business.facebook.com/${integration.getIn(
                                                ['meta', 'page_id'],
                                                ''
                                            )}/settings/?tab=messenger_platform`}
                                        >
                                            here
                                        </a>
                                        . In the <b>Whitelisted Domains</b>{' '}
                                        section, just add the address of you
                                        website.
                                        <br />
                                        <br />
                                        Then, copy the code below and paste it
                                        on your website above the{' '}
                                        <b>{'</body>'}</b> tag:
                                    </p>
                                }
                                code={renderFacebookCodeSnippet(integration)}
                            />
                        </Col>

                        <Col md="6">
                            <div className={css.preview}>
                                <div className={css.titlebar} />
                                <img
                                    alt="facebook messenger logo"
                                    className={css.image}
                                    src={`${
                                        window.GORGIAS_ASSETS_URL || ''
                                    }/static/private/img/presentationals/messenger-preview.png`}
                                />
                            </div>
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

export default connect(mapStateToProps, {notify})(
    FacebookIntegrationCustomerChat
)

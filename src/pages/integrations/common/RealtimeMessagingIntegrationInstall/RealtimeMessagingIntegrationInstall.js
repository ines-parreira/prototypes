// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import Clipboard from 'clipboard'
import {capitalize} from 'lodash'
import {Link} from 'react-router'
import classnames from 'classnames'
import {
    Alert,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    CardBody,
    Col,
    Container,
    Row,
} from 'reactstrap'

import {
    FACEBOOK_INTEGRATION_TYPE,
    SHOPIFY_INTEGRATION_TYPE,
    SMOOCH_INSIDE_INTEGRATION_TYPE
} from '../../../../constants/integration'

import {notify} from '../../../../state/notifications/actions'
import PageHeader from '../../../common/components/PageHeader'
import RealtimeMessagingIntegrationNavigation from '../RealtimeMessagingIntegrationNavigation'

import * as integrationSelectors from '../../../../state/integrations/selectors'

import IntegrationCard from './IntegrationCard'
import {renderChatCodeSnippet, renderFacebookCodeSnippet} from './utils'
import css from './RealtimeMessagingIntegrationInstall.less'


const targetIntegrationTypes = fromJS([
    SHOPIFY_INTEGRATION_TYPE
])


type Props = {
    domain: string,
    actions: any,
    notify: ({}) => void,
    getIntegrationsByTypes: (string) => List<Map<*,*>>,
    integration: Map<*, *>,
}

type State = {
    name: string,
    email: string,
    integrationLoading: ?boolean,
    isCopied: boolean,
}


class RealtimeMessagingIntegrationInstall extends React.Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
        isCopied: false
    }

    clearIsCopiedTimeout: ?number = null

    clipboard: Clipboard = null

    componentDidMount() {
        this.clipboard = new Clipboard('#copy-code-snippet')
        this.clipboard.on('success', () => {
            this.setState({isCopied: true})

            if (this.clearIsCopiedTimeout) {
                clearTimeout(this.clearIsCopiedTimeout)
            }

            this.clearIsCopiedTimeout = setTimeout(() => {
                this.setState({isCopied: false})
                this.clearIsCopiedTimeout = null
            }, 1500)
        })
    }

    componentWillUnmount() {
        clearTimeout(this.clearIsCopiedTimeout)

        if (this.clipboard) {
            this.clipboard.destroy()
        }
    }

    _getDisplayableType = (integrationType: string): string => {
        if (integrationType === SMOOCH_INSIDE_INTEGRATION_TYPE) {
            return 'Chat'
        } else if (integrationType === FACEBOOK_INTEGRATION_TYPE) {
            return 'Facebook, Messenger & Instagram'
        }

        return capitalize(integrationType)
    }

    render() {
        const {integration, getIntegrationsByTypes, actions} = this.props

        const isChat = integration.get('type') === SMOOCH_INSIDE_INTEGRATION_TYPE
        const isFacebook = integration.get('type') === FACEBOOK_INTEGRATION_TYPE

        if (!integration.isEmpty() && !isChat && !isFacebook) {
            // Something is wrong
            return null
        }

        const integrationName = isChat ? integration.get('name') : integration.getIn(['facebook', 'name'])
        const pageTitle = isChat ? 'Installation' : 'Customer chat'

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to={`/app/settings/integrations/${integration.get('type')}`}>
                                {this._getDisplayableType(integration.get('type'))}
                            </Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            {integrationName}
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {pageTitle}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <RealtimeMessagingIntegrationNavigation integration={integration}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col md={isChat ? '8' : '6'}>
                            {
                                targetIntegrationTypes.map((targetIntegrationType) => {
                                    return (
                                        <IntegrationCard
                                            key={targetIntegrationType}
                                            integrationType={targetIntegrationType}
                                            targetIntegrations={getIntegrationsByTypes(targetIntegrationType)}
                                            integration={integration}
                                            updateOrCreateIntegration={actions.updateOrCreateIntegration}
                                        />
                                    )
                                })
                            }

                            <Card className={css['integration-card']}>
                                <CardBody>
                                    <div className={css['card-body']}>
                                        <div className={css['logo-wrapper']}>
                                            <img
                                                alt="javascript-logo"
                                                src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/integrations/javascript.png`}
                                            />
                                        </div>
                                        <div>
                                            <h3>Javascript</h3>
                                            {
                                                !isChat ? (
                                                    <p>
                                                        To install the Messenger widget on your website
                                                        manually, you first need to whitelist your website's
                                                        domain for your Facebook page on Facebook.
                                                        You can do so{' '}
                                                        <a
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            href={`https://business.facebook.com/${integration.getIn(['facebook', 'page_id'], '')}/settings/?tab=messenger_platform`}
                                                        >
                                                            here
                                                        </a>
                                                        . In the <b>Whitelisted Domains</b> section,
                                                        just add the address of you website.<br/><br/>
                                                        Then, copy the code below and paste it on your website
                                                        above the <b>{'</body>'}</b> tag:
                                                    </p>
                                                ) : (
                                                    <p>
                                                        Copy the code below and paste it on your website
                                                        above the <b>{'</body>'}</b> tag:
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>
                                    <Alert className={css['code-wrapper']}>
                                        <pre
                                            id="code-snippet"
                                            className={css.code}
                                        >
                                            {
                                                isChat
                                                    ? renderChatCodeSnippet(integration)
                                                    : renderFacebookCodeSnippet(integration)
                                            }
                                        </pre>
                                    </Alert>
                                </CardBody>
                                <Button
                                    id="copy-code-snippet"
                                    type="button"
                                    color="info"
                                    className={classnames(css.copy, {'mr-4': !isChat})}
                                    data-clipboard-target="#code-snippet"
                                >
                                    <i className="material-icons-outlined mr-2">
                                        file_copy
                                    </i>
                                    {this.state.isCopied ? 'Copied!' : 'Copy'}
                                </Button>
                            </Card>
                        </Col>

                        {
                            !isChat ? (
                                <Col md="6">
                                    <div className={css.preview}>
                                        <div className={css.titlebar}/>
                                        <img
                                            className={css.image}
                                            src={`${window.GORGIAS_ASSETS_URL || ''}/static/private/img/presentationals/messenger-preview.png`}
                                        />
                                    </div>
                                </Col>
                            ) : null
                        }
                    </Row>
                </Container>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        domain: state.currentAccount.get('domain'),
        getIntegrationsByTypes: integrationSelectors.makeGetIntegrationsByTypes(state)
    }
}

export default connect(mapStateToProps, {notify})(RealtimeMessagingIntegrationInstall)

// @flow
import React from 'react'
import {connect} from 'react-redux'
import {fromJS, Map, List} from 'immutable'
import Clipboard from 'clipboard'
import {capitalize} from 'lodash'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {
    Alert,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Col,
    Container,
    Form,
    Row
} from 'reactstrap'

import css from './RealtimeMessagingIntegrationInstall.less'
import {notify} from '../../../../state/notifications/actions'

import * as integrationSelectors from './../../../../state/integrations/selectors'
import * as integrationHelpers from './../../../../state/integrations/helpers'

import {renderChatCodeSnippet, renderFacebookCodeSnippet} from './utils'
import PageHeader from '../../../common/components/PageHeader'
import RealtimeMessagingIntegrationNavigation from '../RealtimeMessagingIntegrationNavigation'


type Props = {
    domain: string,
    actions: any,
    notify: ({}) => void,
    shopifyIntegrations: List<Map<*, *>>,
    shopifyIntegrationsWithoutChat: List<Map<*, *>>,
    shopifyIntegrationsWithoutFacebook: List<Map<*, *>>,
    integration: Map<*, *>,
}

type State = {
    name: string,
    email: string,
    integrationLoading: boolean | null,
    isCopied: boolean,
}


class RealtimeMessagingIntegrationInstall extends React.Component<Props, State> {
    state = {
        name: '',
        email: '',
        integrationLoading: null,
        isCopied: false
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copy-code-snippet')
        clipboard.on('success', () => {
            this.setState({isCopied: true})
            setTimeout(() => {
                this.setState({isCopied: false})
            }, 1500)
        })
    }

    _installOnShopifyStore = (shopifyIntegration) => {
        this.setState({integrationLoading: shopifyIntegration.get('id')})

        if (shopifyIntegration.getIn(['meta', 'need_scope_update'])) {
            return browserHistory.push(
                `/app/settings/integrations/shopify/${shopifyIntegration.get('id')}/?error=need_scope_update`
            )
        }

        const shopifyId = shopifyIntegration.get('id')
        let shopifyIntegrationIdsList = this.props.integration.getIn(['meta', 'shopify_integration_ids'], fromJS([]))

        if (!shopifyIntegrationIdsList.contains(shopifyId)) {
            shopifyIntegrationIdsList = shopifyIntegrationIdsList.push(shopifyId)
        }

        const integration = this.props.integration.setIn(['meta', 'shopify_integration_ids'], shopifyIntegrationIdsList)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration.get('meta')
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form)).then(() => {
            this.setState({integrationLoading: null})
        })
    }

    _removeFromShopifyStore = (integrationId) => {
        const {integration} = this.props

        const indexToDelete = integration.getIn(['meta', 'shopify_integration_ids'], fromJS([]))
            .findIndex((value) => value === integrationId)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration.get('meta').deleteIn(['shopify_integration_ids', indexToDelete])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form))
    }

    _getDisplayableType = (integrationType) => {
        if (integrationType === 'smooch_inside') {
            return 'Chat'
        } else if (integrationType === 'facebook') {
            return 'Facebook, Messenger & Instagram'
        }

        return capitalize(integrationType)
    }

    render() {
        const {
            integration,
            shopifyIntegrations,
            shopifyIntegrationsWithoutChat,
            shopifyIntegrationsWithoutFacebook
        } = this.props

        const isChat = this.props.integration.get('type') === 'smooch_inside'
        const isFacebook = this.props.integration.get('type') === 'facebook'

        if (!integration.isEmpty() && !isChat && !isFacebook) {
            // Something is wrong
            return null
        }

        const shopifyIntegrationsWithoutWidget = isChat
            ? shopifyIntegrationsWithoutChat
            : shopifyIntegrationsWithoutFacebook

        const integrationName = isChat ? integration.get('name') : integration.getIn(['facebook', 'name'])
        const integrationAlias = isChat ? 'chat' : 'customer chat'
        const pageTitle = isChat ? 'Installation' : 'Customer chat'
        const pageDescription = isChat
            ? 'Let\'s install your chat on your website.'
            : (
                <span>
                    Customer chat allows customers to contact you through Messenger directly on your website.{' '}
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://docs.gorgias.io/facebok/customer-chat"
                    >
                        Learn more.
                    </a>
                </span>
            )

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
                            <p>{pageDescription}</p>
                            <div>
                                {
                                    integration.getIn(['meta', 'shopify_integration_ids'], fromJS([]))
                                        .map((integrationId) => {
                                            const shopifyIntegration = shopifyIntegrations.find((integration) => {
                                                return integration.get('id') === integrationId
                                            })

                                            if (!shopifyIntegration) {
                                                return null
                                            }

                                            return (
                                                <p key={integrationId}>
                                                    {capitalize(integrationAlias)} installed on{' '}
                                                    {`${shopifyIntegration.get('name')}`}.{' '}
                                                    <a
                                                        href
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            this._removeFromShopifyStore(integrationId)
                                                        }}
                                                    >
                                                        Remove
                                                    </a>
                                                </p>
                                            )
                                        })
                                }
                            </div>

                            <div className={classnames(css.form, 'shopifyIntegrationsList')}>
                                {
                                    shopifyIntegrationsWithoutWidget.map((integration, idx) => {
                                        return (
                                            <Button
                                                key={idx}
                                                block
                                                onClick={() => {
                                                    this._installOnShopifyStore(integration)
                                                }}
                                                className={classnames('mb-2', {
                                                    'btn-loading': this.state.integrationLoading === integration.get('id')
                                                })}
                                                color="secondary"
                                            >
                                                <img
                                                    className="shopifyLogo"
                                                    src={integrationHelpers.getIconFromType('shopify')}
                                                />
                                                Add {integrationAlias} on {integration.get('name')}
                                            </Button>
                                        )
                                    })
                                }
                                {
                                    !shopifyIntegrationsWithoutWidget.isEmpty()
                                        ? (
                                            <p>
                                                Can't see your store here?{' '}
                                                <Link to="/app/settings/integrations/shopify/new/">Connect it to
                                                    Gorgias</Link>
                                            </p>
                                        ) : (
                                            <p>
                                                You're using Shopify?{' '}
                                                <Link to="/app/settings/integrations/shopify/new/">Connect your store to
                                                    Gorgias</Link>
                                                {' '}and add your {integrationAlias} in one click.
                                            </p>
                                        )
                                }


                                <div className="divider">OR</div>

                                <Form
                                    onSubmit={() => browserHistory.push(`/app/settings/integrations/${integration.get('type')}/${integration.get('id')}/`)}>

                                    {
                                        !isChat ? (
                                            <p>
                                                To install the Messenger widget on your website manually, you first need
                                                to whitelist your website's domain for your Facebook page on Facebook.
                                                You can do so{' '}
                                                <a
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    href={`https://business.facebook.com/${integration.getIn(['facebook', 'page_id'], '')}/settings/?tab=messenger_platform`}
                                                >
                                                    here
                                                </a>
                                                . In the <kbd>Whitelisted Domains</kbd> section, just add the address
                                                of you website.<br/><br/>
                                                Then, copy the code below and paste it on your website
                                                above the {' '}<kbd>{'</body>'}</kbd>{' '}tag:
                                            </p>
                                        ) : (
                                            <p>
                                                Copy the code below and paste it on your website above the
                                                {' '}<kbd>{'</body>'}</kbd>{' '}tag:
                                            </p>
                                        )
                                    }

                                    <div className={css.snippet}>
                                        <Card className="p-0 mb-2">
                                            <Alert
                                                color="info"
                                                className="m-0"
                                            >
                                            <pre
                                                style={{
                                                    display: 'flex',
                                                    height: '160px',
                                                    color: 'inherit'
                                                }}
                                                id="code-snippet"
                                            >
                                                {
                                                    isChat
                                                        ? renderChatCodeSnippet(integration)
                                                        : renderFacebookCodeSnippet(integration)
                                                }
                                            </pre>
                                            </Alert>
                                        </Card>

                                        <Button
                                            id="copy-code-snippet"
                                            type="button"
                                            color="info"
                                            className={css.copy}
                                            data-clipboard-target="#code-snippet"
                                        >
                                            <i className="material-icons mr-2">
                                                file_copy
                                            </i>
                                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                                        </Button>
                                    </div>
                                </Form>
                            </div>
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
        shopifyIntegrationsWithoutChat: integrationSelectors.getShopifyIntegrationsWithoutChat(state),
        shopifyIntegrationsWithoutFacebook: integrationSelectors.getShopifyIntegrationsWithoutFacebook(state),
        shopifyIntegrations: integrationSelectors.getIntegrationsByTypes('shopify')(state)
    }
}

export default connect(mapStateToProps, {notify})(RealtimeMessagingIntegrationInstall)

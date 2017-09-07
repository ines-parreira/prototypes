import React, {PropTypes} from 'react'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import Clipboard from 'clipboard'
import {Link, browserHistory} from 'react-router'
import classnames from 'classnames'
import {
    Alert,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Card,
    Form
} from 'reactstrap'

import css from './ChatIntegrationInstall.less'
import {notify} from '../../../../../../state/notifications/actions'

import * as integrationSelectors from './../../../../../../state/integrations/selectors'
import * as integrationHelpers from './../../../../../../state/integrations/helpers'

import {renderCodeSnippet} from '../utils'


class ChatIntegrationInstall extends React.Component {
    static propTypes = {
        domain: PropTypes.string.isRequired,
        actions: PropTypes.object.isRequired,
        notify: PropTypes.func.isRequired,
        shopifyIntegrations: PropTypes.object.isRequired,
        shopifyIntegrationsWithoutChat: PropTypes.object.isRequired,
        integration: PropTypes.object.isRequired
    }

    state = {
        name: '',
        email: '',
        integrationLoading: null
    }

    componentDidMount() {
        const clipboard = new Clipboard('#copy-chat-snippet')
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
                `/app/integrations/shopify/${shopifyIntegration.get('id')}/?error=need_scope_update`
            )
        }

        const shopifyId = shopifyIntegration.get('id')
        let shopifyIntegrationIdsList = this.props.integration.getIn(['meta', 'shopify_integration_ids'], fromJS([]))

        if (!shopifyIntegrationIdsList.contains(shopifyId)) {
            shopifyIntegrationIdsList = shopifyIntegrationIdsList.push(shopifyId)
        }

        const integration = this.props.integration.setIn(['meta', 'shopify_integration_ids'], shopifyIntegrationIdsList)

        return this.props.actions.updateOrCreateIntegration(integration).then(() => {
            this.setState({integrationLoading: null})
        })
    }

    _removeFromShopifyStore = (integrationId) => {
        const {integration} = this.props

        const indexToDelete = integration.getIn(['meta', 'shopify_integration_ids'])
            .findIndex((value) => value === integrationId)

        const form = {
            id: integration.get('id'),
            type: integration.get('type'),
            meta: integration.get('meta').deleteIn(['shopify_integration_ids', indexToDelete])
        }

        return this.props.actions.updateOrCreateIntegration(fromJS(form))
    }

    render() {
        const {
            integration,
            shopifyIntegrations,
            shopifyIntegrationsWithoutChat
        } = this.props

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/smooch_inside">Chat</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        {integration.get('name')}
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Installation
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    Installation
                </h1>

                <p>Let's install your chat on your website.</p>

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
                                        Chat installed on {`${shopifyIntegration.get('name')}`}.{' '}
                                        <a
                                            href=""
                                            onClick={() => this._removeFromShopifyStore(integrationId)}
                                        >
                                            Remove
                                        </a>
                                    </p>
                                )
                            })
                    }
                </div>

                <div className={css.form}>
                    {
                        shopifyIntegrationsWithoutChat.map((integration, idx) => {
                            return (
                                <Button
                                    key={idx}
                                    block
                                    onClick={() => {this._installOnShopifyStore(integration)}}
                                    className={classnames('mb-2', {
                                        'btn-loading': this.state.integrationLoading === integration.get('id')
                                    })}
                                    color="secondary"
                                >
                                    <img
                                        className={css.shopifyLogo}
                                        src={integrationHelpers.getIconFromType('shopify')}
                                    />
                                    Add chat on {integration.get('name')}
                                </Button>
                            )
                        })
                    }
                    {
                        !shopifyIntegrationsWithoutChat.isEmpty()
                            ? (
                                <p className="text-muted text-center">
                                    Can't see your store here?{' '}
                                    <Link to="/app/integrations/shopify/new/">Connect it to Gorgias</Link>
                                </p>
                            ) : (
                                <p className="text-muted text-center">
                                    You're using Shopify?{' '}
                                    <Link to="/app/integrations/shopify/new/">Connect your store to Gorgias</Link>
                                    {' '}and add your chat in one click.
                                </p>
                            )
                    }


                    <div className="divider">OR</div>

                    <Form onSubmit={() => browserHistory.push(`/app/integrations/smooch_inside/${integration.get('id')}/`)}>

                        <p>
                            Copy the code below and paste it on your website above the
                            {' '}<kbd>{'</body>'}</kbd>{' '}tag:
                        </p>

                        <div className={css.snippet}>
                        <Card className="p-0 mb-2">
                            <Alert color="info" className="m-0">
                                <pre
                                    style={{
                                        display: 'flex',
                                        height: '200px',
                                        color: 'inherit'
                                    }}
                                    id="chat-snippet"
                                >
                                    {renderCodeSnippet(integration)}
                                </pre>
                            </Alert>
                        </Card>

                        <Button
                            id="copy-chat-snippet"
                            type="button"
                            color="info"
                            className={css.copy}
                            data-clipboard-target="#chat-snippet"
                        >
                            <i className="fa fa-fw fa-files-o mr-2" />
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        </div>
                    </Form>
                </div>
            </div>
        )
    }
}

const mapStateToProps = state => ({
    domain: state.currentAccount.get('domain'),
    shopifyIntegrationsWithoutChat: integrationSelectors.getShopifyIntegrationsWithoutChat(state),
    shopifyIntegrations: integrationSelectors.getIntegrationsByTypes('shopify')(state)
})

export default connect(mapStateToProps, {notify})(ChatIntegrationInstall)

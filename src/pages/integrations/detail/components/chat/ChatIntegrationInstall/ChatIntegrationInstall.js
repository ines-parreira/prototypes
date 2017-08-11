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

import detailCss from '../ChatIntegrationDetail.less'


class ChatIntegrationInstall extends React.Component {
    static propTypes = {
        domain: PropTypes.string.isRequired,
        actions: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        notify: PropTypes.func.isRequired,
        shopifyIntegrations: PropTypes.object.isRequired,
        integration: PropTypes.object.isRequired
    }

    state = {
        name: '',
        email: '',
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

    _installOnShopify = (shopifyIntegration) => {
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
            browserHistory.push(`/app/integrations/smooch_inside/${integration.get('id')}/`)
        })
    }

    render() {
        const {
            integration,
            loading,
            shopifyIntegrations,
        } = this.props

        const isSubmitting = loading.get('updateIntegration') === integration.get('id')

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
                        <Link to={`/app/integrations/smooch_inside/${integration.get('id')}`}>
                            {integration.get('name')}
                            </Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        Install
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>
                    Install
                </h1>

                <p>Let's install your chat on your website.</p>

                <div className={css.form}>
                    {
                        shopifyIntegrations.map((integration, idx) => {
                            return (
                                <Button
                                    key={idx}
                                    block
                                    onClick={() => {this._installOnShopify(integration)}}
                                    className="mb-2"
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
                        !shopifyIntegrations.isEmpty()
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

                        <div className={detailCss.snippet}>
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
                            className={detailCss.copy}
                            data-clipboard-target="#chat-snippet"
                        >
                            <i className="fa fa-fw fa-files-o mr-2" />
                            {this.state.isCopied ? 'Copied!' : 'Copy'}
                        </Button>
                        </div>

                        <div>
                            <Button
                                type="submit"
                                block
                                color="primary"
                                className={classnames({
                                    'btn-loading': isSubmitting,
                                })}
                                disabled={isSubmitting}
                            >
                                I added the code to my website
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
    shopifyIntegrations: integrationSelectors.getShopifyIntegrationsWithoutChat(state)
})

export default connect(mapStateToProps, {notify})(ChatIntegrationInstall)

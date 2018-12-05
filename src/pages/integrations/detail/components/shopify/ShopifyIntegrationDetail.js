// @flow
import React from 'react'
import {browserHistory, Link, withRouter} from 'react-router'
import {connect} from 'react-redux'
import classNames from 'classnames'
import {fromJS, Map} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {
    Alert,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
    Container,
    Row,
    Col,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'
import PageHeader from '../../../../common/components/PageHeader'

import * as utils from '../../../../../utils'
import {notify} from './../../../../../state/notifications/actions'
import * as integrationSelectors from './../../../../../state/integrations/selectors'

export const defaultContent = {
    type: 'shopify',
    meta: {}
}

type Props = {
    integration: Map<*,*>,
    isUpdate: boolean,
    actions: Object,
    loading: Object,

    redirectUri: string,

    getExistingShopifyIntegration: (string) => Map<*,*>,

    // Router
    location: Object,

    // Actions
    notify: typeof notify
}

type State = {
    name: string,
    isInitialized: boolean
}

class ShopifyIntegrationDetail extends React.Component<Props, State> {
    state = {
        name: '',
        isInitialized: false
    }

    componentDidMount() {
        // display message from url
        const {
            location: {
                query: {
                    message,
                    message_type: status = 'info',
                    error
                }
            },
            isUpdate
        } = this.props

        this.setState({isInitialized: !isUpdate})

        if (error === 'need_scope_update') {
            this.props.notify({
                status: 'error',
                message: 'You need to update your app permissions in order to do that.'
            })
        }

        if (message) {
            this.props.notify({
                status,
                message: decodeURIComponent(message.replace(/\+/g, ' '))
            })
            // remove error from url
            browserHistory.push(window.location.pathname)
        }
    }

    componentWillReceiveProps(nextProps) {
        if (_isEmpty(this.props.integration.toJS()) && !_isEmpty(nextProps.integration.toJS())) {
            const authenticationRequired = nextProps.integration.getIn(['meta', 'oauth', 'status']) === 'pending'
            const isAuthenticating = nextProps.location.query.action === 'authentication'

            if (isAuthenticating) {
                if (authenticationRequired) {
                    setTimeout(
                        nextProps.actions.fetchIntegration(
                            nextProps.integration.get('id'),
                            nextProps.integration.get('type'),
                            true)
                        , 3000)
                } else {
                    nextProps.actions.triggerCreateSuccess(nextProps.integration.toJS())
                }
            }
        }
    }

    componentWillUpdate(nextProps, nextState) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!nextState.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState({
                name: integration.get('name'),
                isInitialized: true
            })
        }
    }

    _handleSubmit = (evt: Event): void => {
        evt.preventDefault()
        const {isUpdate, integration, actions} = this.props

        let doc = fromJS(defaultContent).mergeDeep({
            name: utils.subdomain(this.state.name)
        })
        let name = doc.get('name')

        doc = doc.setIn(['meta', 'shop_name'], name)

        // if update, set ids for server
        if (isUpdate) {
            doc = doc.set('id', integration.get('id'))
            actions.updateOrCreateIntegration(doc)
        }

        window.location.href = this.props.redirectUri.replace('{shop_name}', name)
    }

    _updateAppPermissions = (): void => {
        const {integration, redirectUri} = this.props
        window.location.href = redirectUri.replace('{shop_name}', integration.getIn(['meta', 'shop_name'], ''))
    }

    render() {
        const {actions, integration, isUpdate, loading, getExistingShopifyIntegration} = this.props
        const {name: shopName} = this.state

        const isSubmitting = loading.get('updateIntegration')

        const isActive = !integration.get('deactivated_datetime')
        const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])
        const authenticationRequired = integration.getIn(['meta', 'oauth', 'status']) === 'pending'
        const isSyncOver = integration.getIn(['meta', 'sync_state', 'is_initialized'])

        const ctaIsLoading = isSubmitting || authenticationRequired

        if (loading.get('integration')) {
            return <Loader />
        }

        const error = !isUpdate && !getExistingShopifyIntegration(shopName).isEmpty()
            ? 'There is already another integration for this Shopify store'
            : null

        return (
            <div className="full-width">
                <PageHeader title={(
                    <Breadcrumb>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations">Integrations</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem>
                            <Link to="/app/settings/integrations/shopify">Shopify</Link>
                        </BreadcrumbItem>
                        <BreadcrumbItem active>
                            {isUpdate ? integration.get('name') : 'Add integration'}
                        </BreadcrumbItem>
                    </Breadcrumb>
                )}/>

                <Container
                    fluid
                    className="page-container"
                >
                    <Row>
                        <Col md="8">
                            {
                                !isUpdate ? (
                                    <p>
                                        Let's connect your store to Gorgias. We'll import your Shopify customers in
                                        Gorgias, along with their order information. This way, when they contact you,
                                        you'll be able to see their Shopify information next to tickets.
                                    </p>
                                ) : null
                            }
                            {
                                isUpdate ? (
                                    isSyncOver ? (
                                        <p>
                                            All your Shopify customers have been imported. You can now see their info
                                            in the sidebar. <Link to="/app/customers">Review your customers.</Link>
                                        </p>
                                    ) : (
                                        <Alert
                                            color="info"
                                            className="mb-4"
                                        >
                                            <p>
                                                <b className="alert-heading">
                                                    <i className="material-icons md-spin mr-2">
                                                        autorenew
                                                    </i>
                                                    Importing your Shopify customers
                                                </b>
                                            </p>
                                            <p>
                                                We're currently importing all your Shopify customers. This way, you'll
                                                see customer info & orders next to tickets. We'll notify you via email
                                                when the import is done. We typically sync 3,000 customers an hour.
                                                <Link to="/app/customers">Review imported customers.</Link>
                                            </p>
                                        </Alert>
                                    )
                                ) : null
                            }

                            <Form onSubmit={this._handleSubmit}>
                                <InputField
                                    type="text"
                                    name="name"
                                    label="Store name"
                                    placeholder={'ex: "acme" for acme.myshopify.com'}
                                    required
                                    disabled={isUpdate}
                                    value={shopName}
                                    error={error}
                                    onChange={(name) => this.setState({name})}
                                    rightAddon=".myshopify.com"
                                />

                                <div>
                                    {
                                        isUpdate && needScopeUpdate ? (
                                            <Button
                                                type="button"
                                                color="info"
                                                className={classNames({
                                                    'btn-loading': isSubmitting,
                                                }, 'mr-2')}
                                                disabled={isSubmitting}
                                                onClick={this._updateAppPermissions}
                                            >
                                                Update app permissions
                                            </Button>
                                        ) : null
                                    }

                                    {
                                        !isUpdate ? (
                                            <Button
                                                type="submit"
                                                color="success"
                                                className={classNames('mr-2', {
                                                    'btn-loading': ctaIsLoading,
                                                })}
                                                disabled={isSubmitting || !!error}
                                            >
                                                Add integration
                                            </Button>
                                        ) : null
                                    }

                                    {
                                        !authenticationRequired && isUpdate && isActive ? (
                                            <Button
                                                type="button"
                                                color="warning"
                                                outline
                                                className={classNames({
                                                    'btn-loading': isSubmitting,
                                                })}
                                                onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                            >
                                                Deactivate integration
                                            </Button>
                                        ) : null
                                    }
                                    {
                                        !authenticationRequired && isUpdate && !isActive ? (
                                            <Button
                                                type="button"
                                                color="success"
                                                className={classNames({
                                                    'btn-loading': isSubmitting,
                                                })}
                                                onClick={() => actions.activateIntegration(integration.get('id'))}
                                            >
                                                Re-activate integration
                                            </Button>
                                        ) : null
                                    }
                                    {
                                        isUpdate ? (
                                            <ConfirmButton
                                                className="float-right"
                                                color="secondary"
                                                confirm={() => actions.deleteIntegration(integration)}
                                                content="Are you sure you want to delete this integration?"
                                            >
                                                <i className="material-icons mr-1 text-danger">
                                                    delete
                                                </i>
                                                Delete integration
                                            </ConfirmButton>
                                        ) : null
                                    }
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Container>
            </div>
        )
    }
}

export default withRouter(connect((state) => {
    return {
        getExistingShopifyIntegration: integrationSelectors.makeGetShopifyIntegrationByShopName(state)
    }
}, {notify})(ShopifyIntegrationDetail))

import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import {connect} from 'react-redux'
import {notify} from './../../../../../state/notifications/actions'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _isEmpty from 'lodash/isEmpty'
import {
    Alert,
    Form,
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import Loader from '../../../../common/components/Loader'
import ConfirmButton from '../../../../common/components/ConfirmButton'
import InputField from '../../../../common/forms/InputField'

import * as utils from '../../../../../utils'

export const defaultContent = {
    type: 'shopify',
    meta: {}
}

class ShopifyIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate
    }

    state = {
        name: ''
    }

    componentDidMount() {
        const needScopeUpdate = this.props.location.query.error === 'need_scope_update'

        if (needScopeUpdate) {
            this.props.notify({
                status: 'error',
                message: 'You need to update your app permissions in order to do that.'
            })
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

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.setState({
                name: integration.get('name')
            })
            this.isInitialized = true
        }
    }

    _handleSubmit = (e) => {
        e.preventDefault()

        let doc = fromJS(defaultContent).mergeDeep({
            name: utils.subdomain(this.state.name)
        })
        let name = doc.get('name')

        doc = doc.setIn(['meta', 'shop_name'], name)

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc.set('id', integration.get('id'))
            return this.props.actions.updateOrCreateIntegration(doc)
        }

        window.location.href = this.props.redirectUri.replace('{shop_name}', name)
    }

    _updateAppPermissions = () => {
        const name = this.props.integration.getIn(['meta', 'shop_name'])
        window.location.href = this.props.redirectUri.replace('{shop_name}', name)
    }

    render() {
        const {actions, integration, isUpdate, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        const ctaIsLoading = isSubmitting || authenticationRequired

        const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])

        const isSyncOver = integration.getIn(['meta', 'sync_state', 'is_initialized'])

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div>
                <Breadcrumb>
                    <BreadcrumbItem>
                        <Link to="/app/integrations">Integrations</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem>
                        <Link to="/app/integrations/shopify">Shopify</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? integration.get('name') : 'Add'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1 className="mb-4">{isUpdate ? integration.get('name') : 'Add integration'}</h1>

                {
                    !isUpdate && (
                        <p>
                            Let's connect your store to Gorgias. We'll import your Shopify customers in Gorgias, along
                            with their order information. This way, when they contact you, you'll be able to see their
                            Shopify information next to tickets.
                        </p>
                    )
                }
                {
                    isUpdate && (
                        isSyncOver
                            ? (
                                <p>
                                    All your Shopify users have been imported. You can now see their info in the
                                    sidebar. <Link to="/app/users">Review your users.</Link>
                                </p>
                            ) : (
                                <Alert color="info" className="mb-4">
                                    <p>
                                        <b className="alert-heading">
                                            <i className="fa fa-refresh fa-spin mr-2" />
                                            Importing your Shopify customers
                                        </b>
                                    </p>
                                    <p>
                                        We're currently importing all your Shopify customers. This way, you'll see
                                        customer info & orders next to tickets. We'll notify you via email when the
                                        import is done. <Link to="/app/users">Review imported users.</Link>
                                    </p>
                                </Alert>
                            )
                    )
                }

                <Form onSubmit={this._handleSubmit}>
                    <InputField
                        type="text"
                        name="name"
                        label="Store name"
                        placeholder={'ex: "acme" for acme.myshopify.com'}
                        required
                        disabled={isUpdate}
                        value={this.state.name}
                        onChange={(name) => this.setState({name})}
                        rightAddon=".myshopify.com"
                    />

                    <div>
                        {
                            isUpdate
                            && needScopeUpdate
                            && (
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
                            )
                        }

                        {
                            !isUpdate && (
                                <Button
                                    type="submit"
                                    color="primary"
                                    className={classNames('mr-2', {
                                        'btn-loading': ctaIsLoading,
                                    })}
                                    disabled={isSubmitting}
                                >
                                    Add integration
                                </Button>
                            )
                        }

                        {
                            !authenticationRequired && isUpdate && isActive && (
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
                            )
                        }

                        {
                            !authenticationRequired && isUpdate && !isActive && (
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
                            )
                        }

                        {
                            isUpdate && (
                                <ConfirmButton
                                    className="pull-right"
                                    color="danger"
                                    confirm={() => actions.deleteIntegration(integration)}
                                    content="Are you sure you want to delete this integration?"
                                >
                                    Delete
                                </ConfirmButton>
                            )
                        }
                    </div>
                </Form>
            </div>
        )
    }
}

ShopifyIntegrationDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,

    redirectUri: PropTypes.string.isRequired,

    // Router
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,

    // Actions
    notify: PropTypes.func.isRequired
}

export default withRouter(connect(null, {notify})(ShopifyIntegrationDetail))

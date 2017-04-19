import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import _isEmpty from 'lodash/isEmpty'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import {Loader} from '../../../../common/components/Loader'
import {LabeledInputField} from '../../../../common/forms'
import formSender from '../../../../common/utils/formSender'

export const defaultContent = {
    type: 'shopify',
    meta: {}
}

class ShopifyIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initialize(_clone(defaultContent))
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
            this.props.initialize(integration.toJS())
            this.isInitialized = true
        }
    }

    _handleSubmit = (values) => {
        let doc = fromJS(defaultContent).mergeDeep(values)
        const name = doc.get('name')

        doc = doc.setIn(['meta', 'shop_name'], name)

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc.set('id', integration.get('id'))
            return formSender(this.props.actions.updateOrCreateIntegration(doc))
        }

        window.location.href = this.props.redirectUri.replace('{shop_name}', name)
    }

    _updateAppPermissions = () => {
        const name = this.props.integration.getIn(['meta', 'shop_name'])
        window.location.href = this.props.redirectUri.replace('{shop_name}', name)
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        const ctaIsLoading = isSubmitting || authenticationRequired

        const needScopeUpdate = integration.getIn(['meta', 'need_scope_update'])

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

                <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>

                <p>Let's connect your store to Gorgias. We'll import your Shopify customers in Gorgias, along with
                    their order information. This way, when they contact you, you'll be able to see their Shopify
                    information next to tickets. </p>

                <form
                    className="ui form"
                    onSubmit={handleSubmit(this._handleSubmit)}
                >
                    <Field
                        name="name"
                        label="Store name"
                        rightLabel=".myshopify.com"
                        maxWidth="50%"
                        placeholder="The name of your Shopify shop"
                        required
                        readOnly={isUpdate}
                        component={LabeledInputField}
                    />
                    <div className="field">
                        {
                            isUpdate
                            && needScopeUpdate
                            && (
                                <button
                                    type="button"
                                    className="ui light blue button"
                                    disabled={isSubmitting}
                                    onClick={() => this._updateAppPermissions()}
                                >
                                    Update app permissions
                                </button>
                            )
                        }

                        {
                            !isUpdate && (
                                <Button
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
                                    onClick={() => actions.deactivateIntegration(integration)}
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
                                    onClick={() => actions.activateIntegration(integration)}
                                >
                                    Re-activate integration
                                </Button>
                            )
                        }

                        {
                            isUpdate && (
                                <Button
                                    type="button"
                                    color="danger"
                                    className={classNames('pull-right', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    onClick={() => actions.deleteIntegration(integration)}
                                >
                                    Delete
                                </Button>
                            )
                        }
                    </div>
                </form>
            </div>
        )
    }
}

ShopifyIntegrationDetail.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,

    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,

    redirectUri: PropTypes.string.isRequired,

    // Router
    location: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
}

export default withRouter(reduxForm({
    form: 'shopifyIntegration',
})(ShopifyIntegrationDetail))

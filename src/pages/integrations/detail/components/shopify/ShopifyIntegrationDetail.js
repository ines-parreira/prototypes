import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'
import _isEmpty from 'lodash/isEmpty'

import {Loader} from '../../../../common/components/Loader'
import {LabeledInputField} from '../../../../common/components/formFields'
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
            <div className="ui grid">
                <div className="ten wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/shopify" className="section">Shopify</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>
                </div>

                <div className="ten wide column">
                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            name="name"
                            label="Shop Name"
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

                            <button
                                className={classNames('ui', 'green', 'button', {'loading disabled': ctaIsLoading})}
                                disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </button>

                            {
                                !authenticationRequired && isUpdate && isActive && (
                                    <button
                                        type="button"
                                        className={classNames('ui basic light floated orange button', {
                                            'loading disabled': isSubmitting
                                        })}
                                        onClick={() => !isSubmitting && actions.deactivateIntegration(integration)}
                                    >
                                        Deactivate integration
                                    </button>
                                )
                            }

                            {
                                !authenticationRequired && isUpdate && !isActive && (
                                    <button
                                        type="button"
                                        className={classNames('ui basic light blue floated button', {
                                            'loading disabled': isSubmitting
                                        })}
                                        onClick={() => !isSubmitting && actions.activateIntegration(integration)}
                                    >
                                        Re-Activate integration
                                    </button>
                                )
                            }

                            {
                                isUpdate && (
                                    <button
                                        className="ui basic light red floated right button"
                                        onClick={() => actions.deleteIntegration(integration)}
                                        type="button"
                                    >
                                        Delete
                                    </button>
                                )
                            }
                        </div>
                    </form>
                </div>
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

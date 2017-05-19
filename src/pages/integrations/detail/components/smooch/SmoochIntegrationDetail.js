import React, {PropTypes} from 'react'
import {Link, withRouter} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import {fromJS} from 'immutable'
import classNames from 'classnames'
import _isEmpty from 'lodash/isEmpty'
import _pick from 'lodash/pick'
import {
    Button,
    Breadcrumb,
    BreadcrumbItem,
} from 'reactstrap'

import formSender from '../../../../common/utils/formSender'
import InputField from './../../../../common/forms/InputField'

import {Loader} from '../../../../common/components/Loader'

class SmoochIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = false
    }

    componentWillUpdate(nextProps) {
        const {integration, isUpdate, loading} = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.props.initialize(integration.toJS())
            this.isInitialized = true
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

    _addNewSmooch = () => {
        window.location.href = this.props.redirectUri
    }

    _handleSubmit = (values) => {
        if (!this.props.isUpdate) {
            return this._addNewSmooch()
        }

        let doc = fromJS(values)

        // only update
        const integration = this.props.integration
        doc = fromJS(_pick(doc.set('id', integration.get('id')).toJS(), ['id', 'name']))
        return formSender(this.props.actions.updateOrCreateIntegration(doc))
    }

    render() {
        const {actions, integration, isUpdate, loading, handleSubmit} = this.props

        const isSubmitting = loading.get('updateIntegration')
        const isActive = !integration.get('deactivated_datetime')

        const authenticationRequired = this.props.integration.getIn(['meta', 'oauth', 'status']) === 'pending'

        const ctaIsLoading = isSubmitting || authenticationRequired

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
                        <Link to="/app/integrations/smooch">Smooch</Link>
                    </BreadcrumbItem>
                    <BreadcrumbItem active>
                        {isUpdate ? integration.get('name') : 'Add'}
                    </BreadcrumbItem>
                </Breadcrumb>

                <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>

                <form
                    className="ui form"
                    onSubmit={handleSubmit(this._handleSubmit)}
                >
                    {
                        isUpdate && (
                            <Field
                                name="name"
                                label="Smooch App Name"
                                placeholder="The name of your Smooch app"
                                defaultValue={integration.get('name')}
                                required
                                component={InputField}
                            />
                        )
                    }
                    <div className="field">
                        <Button
                            type="submit"
                            color="primary"
                            className={classNames({
                                'btn-loading': ctaIsLoading,
                            })}
                            disabled={ctaIsLoading}
                        >
                            {isUpdate ? 'Save changes' : 'Connect my Smooch'}
                        </Button>

                        {
                            !authenticationRequired && isUpdate && isActive && (
                                <Button
                                    type="button"
                                    color="warning"
                                    outline
                                    className={classNames('ml-2', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting}
                                    onClick={() => actions.deactivateIntegration(integration.get('id'))}
                                >
                                    Deactivate
                                </Button>
                            )
                        }

                        {
                            !authenticationRequired && isUpdate && !isActive && (
                                <Button
                                    type="button"
                                    color="success"
                                    className={classNames('ml-2', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting}
                                    onClick={() => actions.activateIntegration(integration.get('id'))}
                                >
                                    Re-activate
                                </Button>
                            )
                        }

                        {
                            isUpdate && (
                                <Button
                                    type="button"
                                    color="danger"
                                    outline
                                    className={classNames('pull-right', {
                                        'btn-loading': isSubmitting,
                                    })}
                                    disabled={isSubmitting}
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

SmoochIntegrationDetail.propTypes = {
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

export default withRouter(reduxForm({form: 'smoochIntegration'})(SmoochIntegrationDetail))

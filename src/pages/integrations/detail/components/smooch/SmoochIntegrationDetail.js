import React, {PropTypes} from 'react'

import {Link} from 'react-router'

import {Field, reduxForm} from 'redux-form'

import classNames from 'classnames'

import {fromJS} from 'immutable'

import {Loader} from '../../../../common/components/Loader'
import {InputField} from '../../../../common/components/semantic'


export const defaultContent = {
    type: 'smooch'
}

class SmoochIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) props.initialize(defaultContent)
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

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc
                .set('id', integration.get('id'))
                .setIn(['smooch', 'id'], integration.getIn(['smooch', 'id']))
        }

        this.props.actions.updateOrCreateIntegration(doc)
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) return <Loader />

        return (
            <div className="ui grid">
                <div className="sixteen wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/smooch" className="section">Smooch</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add integration'}</h1>
                    <div>
                        <p>
                            Smooch is a chat widget that you can add to your website.
                            <br />
                            Every time a user starts a conversation with you, it opens a ticket in Gorgias where you can
                            respond to them.
                        </p>
                    </div>
                    <br />
                    <div>
                        <p>
                            To configure this integration, go to your app settings in Smooch and copy the following keys
                        </p>
                    </div>
                </div>

                <div className="sixteen wide column">
                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            type="text"
                            name="name"
                            label="Name"
                            placeholder="Name"
                            required
                            component={InputField}
                        />
                        <Field
                            type="text"
                            name="connections[0].data.key.id"
                            label="Key ID"
                            placeholder="Key ID"
                            required
                            component={InputField}
                        />
                        <Field
                            type="text"
                            name="connections[0].data.key.secret"
                            label="Secret"
                            placeholder="Secret"
                            required
                            component={InputField}
                        />
                        <div className="field">

                            <button
                                className={classNames('ui', 'green', 'button', {loading: isSubmitting})}
                                disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </button>

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

SmoochIntegrationDetail.propTypes = {
    handleSubmit: PropTypes.func.isRequired,
    initialize: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired,
}

export default reduxForm({
    form: 'smoochIntegration',
})(SmoochIntegrationDetail)

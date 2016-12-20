import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {Field, reduxForm} from 'redux-form'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import _clone from 'lodash/clone'

import {Loader} from '../../../../common/components/Loader'
import {InputField} from '../../../../common/components/formFields'
import formSender from '../../../../common/utils/formSender'

export const defaultContent = {
    type: 'smooch'
}

class SmoochIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initialize(_clone(defaultContent))
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

        // if update, set ids for server
        if (this.props.isUpdate) {
            const integration = this.props.integration
            doc = doc
                .set('id', integration.get('id'))
                .setIn(['smooch', 'id'], integration.getIn(['smooch', 'id']))
        }

        return formSender(this.props.actions.updateOrCreateIntegration(doc))
    }

    _renderInstructions = (isUpdate) => {
        const {integration} = this.props

        if (!isUpdate || !integration.get('id')) {
            return null
        }

        return (
            <div>
                <p>
                    To add a chat to your website, add the following code before the <kbd>{'</body>'}</kbd> on your
                    page:
                </p>
                <pre className="ui info message">
                    {'<script src="https://cdn.smooch.io/smooch.min.js"></script>\n'}
                    {`<script>Smooch.init({appToken: '${integration.getIn(['smooch', 'app_token'])}'});</script>`}
                </pre>
                <p>
                    Chat is provided through Smooch, at no additional cost for you. You can send user data to better
                    identify who you are talking to. Check out {' '}
                    <a href="http://docs.smooch.io/javascript/" target="_blank">Smooch's documentation</a> to learn
                    how to do it.
                </p>
            </div>
        )
    }

    render() {
        const {actions, handleSubmit, integration, isUpdate, loading} = this.props

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) {
            return <Loader />
        }

        return (
            <div className="ui grid">
                <div className="ten wide column">

                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider" />
                        <Link to="/app/integrations/smooch" className="section">Chat</Link>
                        <i className="right angle icon divider" />
                        <a className="active section">{isUpdate ? integration.get('name') : 'Add integration'}</a>
                    </div>

                    <h1>{isUpdate ? integration.get('name') : 'Add new chat'}</h1>
                    <br />
                    {this._renderInstructions(isUpdate)}
                </div>

                <div className="ten wide column">
                    <form
                        className="ui form"
                        onSubmit={handleSubmit(this._handleSubmit)}
                    >
                        <Field
                            name="name"
                            label="Integration name"
                            placeholder="Name"
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
                                        Delete integration
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

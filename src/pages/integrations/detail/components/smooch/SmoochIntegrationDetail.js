import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {reduxForm} from 'redux-form'
import {Loader} from '../../../../common/components/Loader'

export const fields = [
    'name',
    'description',
    'smooch.webhook_id',
    'smooch.webhook_secret'
]

export const defaultContent = {
    type: 'smooch'
}

class SmoochIntegrationDetail extends React.Component {
    constructor(props) {
        super(props)

        this._handleSubmit = this._handleSubmit.bind(this)

        // used to know if form has been asynchronously initialized when updating
        this.isInitialized = !props.isUpdate

        // populating new integration form
        if (!props.isUpdate) {
            props.initializeForm(defaultContent)
        }
    }

    componentWillUpdate(nextProps) {
        const {
            integration,
            isUpdate,
            loading
        } = nextProps

        // populating the form when updating an integration
        if (!this.isInitialized && isUpdate && !loading.get('integration')) {
            this.props.initializeForm(integration.toJS())
            this.isInitialized = true
        }
    }

    _handleSubmit(data) {
        let doc = data

        doc = fromJS(defaultContent).mergeDeep(doc)

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
        const {
            fields: {
                name,
                description,
                smooch
            },
            actions,
            isUpdate,
            integration,
            loading
        } = this.props

        const isSubmitting = loading.get('updateIntegration')

        if (loading.get('integration')) {
            return <Loader />
        }

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
                    <form className="ui form"
                          onSubmit={this.props.handleSubmit(this._handleSubmit)}
                    >
                        <div className="required field">
                            <label>Name</label>
                            <input type="text"
                                   placeholder="Name"
                                   {...name}
                                   required
                            />
                        </div>
                        <div className="field">
                            <label>Description</label>
                            <input type="text"
                                   placeholder="Description"
                                   {...description}
                            />
                        </div>
                        <div className="required field">
                            <label>Key ID</label>
                            <input type="text"
                                   placeholder="Key ID"
                                   {...smooch.webhook_id}
                                   required
                            />
                        </div>
                        <div className="required field">
                            <label>Secret</label>
                            <input type="text"
                                   placeholder="Secret"
                                   {...smooch.webhook_secret}
                                   required
                            />
                        </div>
                        <div className="field">

                            <button className={classNames([
                                'ui',
                                'green',
                                'button',
                                {
                                    loading: isSubmitting
                                }
                            ])}
                                    disabled={isSubmitting}
                            >
                                {isUpdate ? 'Save changes' : 'Add integration'}
                            </button>

                            {(() => {
                                if (isUpdate) {
                                    return (
                                        <button className="ui basic light red floated right button"
                                                onClick={() => actions.deleteIntegration(integration)}
                                        >
                                            Delete
                                        </button>
                                    )
                                }
                            })()}
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

SmoochIntegrationDetail.propTypes = {
    fields: PropTypes.object.isRequired,
    initializeForm: PropTypes.func.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    integration: PropTypes.object.isRequired,
    isUpdate: PropTypes.bool.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}

export default reduxForm(
    {
        form: 'smoochIntegration',
        fields
    }
)(SmoochIntegrationDetail)

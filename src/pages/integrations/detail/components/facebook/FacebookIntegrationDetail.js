import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import classNames from 'classnames'
import {fromJS} from 'immutable'
import {Loader} from '../../../../common/components/Loader'
import {CheckboxField} from '../../../../common/components/formFields'

export default class FacebookIntegrationDetail extends React.Component {
    constructor() {
        super()
        this.state = {
            settings: {
                posts_enabled: true,
                private_messages_enabled: true,
                import_history_enabled: true
            }
        }
    }
    componentWillReceiveProps(nextProps) {
        // set default state
        if (nextProps.integration && !nextProps.integration.isEmpty()
            && !nextProps.integration.equals(this.props.integration)) {
            this.setState({
                settings: nextProps.integration.getIn(['facebook', 'settings']).toJS()
            })
        }
    }

    _onChange = (event) => {
        this.state.settings[event.target.name] = event.target.checked
        this.setState(this.state)
    }

    _handleSubmit = (e) => {
        e.preventDefault()
        const {actions, integration} = this.props
        const settings = this.state.settings
        const updated = integration.mergeDeep({
            facebook: {
                settings
            }
        })
        actions.updateOrCreateIntegration(updated)
    }

    _disable = () => {
        if (window.confirm('Are you sure you want to disable this integration?')) {
            this.props.actions.deactivateIntegration(this.props.integration)
            browserHistory.push('/app/integrations/facebook')
        }
    }

    render() {
        const {integration, loading} = this.props

        if (loading.get('integration') || integration.isEmpty()) {
            return <Loader />
        }

        const page = integration.get('facebook', fromJS({}))
        const submitButtonClassNames = ['ui', 'green', 'button', {loading: loading.get('updateIntegration')}]

        return (
            <div className="ui grid">
                <div className="ten wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/facebook" className="section">Facebook</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">{page.get('name')}</a>
                    </div>
                </div>
                <div className="ten wide column">
                    <div className="ui header">
                        <img
                            className="ui image" alt={page.get('name')}
                            src={page.getIn(['picture', 'data', 'url'])}
                        />
                        <div className="content">
                            {page.get('name')}
                            <p className="sub header">{page.get('about')}</p>
                        </div>
                    </div>
                    <div className="ui form">
                        <div className="field">
                            <CheckboxField
                                label="Enable Facebook Messenger"
                                name="private_messages_enabled"
                                input={{
                                    value: this.state.settings.private_messages_enabled,
                                    onChange: this._onChange,
                                }}
                            />
                        </div>
                        <div className="field">
                            <CheckboxField
                                label="Enable Facebook Posts & Comments"
                                name="posts_enabled"
                                input={{
                                    value: this.state.settings.posts_enabled,
                                    onChange: this._onChange,
                                }}
                            />
                        </div>
                        <div className="field">
                            <CheckboxField
                                label="Import 30 days of history (posts, comments and messages) as closed tickets"
                                name="import_history_enabled"
                                input={{
                                    value: this.state.settings.import_history_enabled,
                                    onChange: this._onChange,
                                }}
                            />
                        </div>
                        <a onClick={this._disable}>Disable this page</a>
                    </div>
                </div>

                <div className="ten wide column">
                    <button
                        className={classNames(submitButtonClassNames)}
                        onClick={this._handleSubmit}
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        )
    }
}

FacebookIntegrationDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}

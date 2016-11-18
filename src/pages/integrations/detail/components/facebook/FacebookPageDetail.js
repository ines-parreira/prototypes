import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import classNames from 'classnames'
import {Loader} from '../../../../common/components/Loader'
import {formatDatetime} from '../../../../../utils'

export default class FacebookPageDetail extends React.Component {
    _disable = () => {
        if (window.confirm('Are you sure you want to disable this integration?')) {
            this.props.actions.deactivateIntegration(this.props.integration)
        }
    }

    _renderConnections = () => {
        const {actions, integration} = this.props
        const connections = integration.get('connections')

        let content = null
        if (!connections || connections.isEmpty()) {
            content = (
                <button className="ui button primary" onClick={actions.facebookLogin}>Login to Facebook</button>
            )
        } else {
            content = (
                <div className="ui labels">
                    {connections.map(c => (
                        <a
                            className="ui label"
                            key={c.get('id')}
                        >
                            Authenticated {formatDatetime(c.get('created_datetime'))} by {c.getIn(['user', 'name'])}
                            <i
                                className="delete icon"
                                onClick={this._disable}
                            />
                        </a>
                    ))}
                </div>
            )
        }
        return (
            <div className="ui segment">
                <h4 className="ui header">Authentication</h4>
                {content}
            </div>
        )
    }

    render() {
        const {actions, integration, loading} = this.props
        const page = integration.get('facebook')

        if (!page || loading.get('integration')) {
            return <Loader />
        }

        // Are we defining the settings for a new page or updating an existing one?
        const isUpdate = !integration.get('deactivated_datetime')

        const submitButtonClassNames = ['ui', 'green', 'button', {loading: loading.get('updateIntegration')}]

        return (
            <div className="ui grid FacebookPageSettingsView">
                <div className="sixteen wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/integrations/facebook" className="section">Facebook</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">{isUpdate ? page.get('name') : 'Add page'}</a>
                    </div>

                    <h1>{integration.getIn(['facebook', 'name'])}</h1>
                    <div>Choose when you want Facebook to create tickets in Gorgias.</div>
                </div>
                <div className="sixteen wide column">
                    {this._renderConnections()}
                    <div className="ui form">
                        <div className="field">
                            <div className="ui checkbox">
                                <input
                                    type="checkbox"
                                    checked={page.getIn(['settings', 'private_messages_enabled'])}
                                    onChange={() => actions.togglePrivateMessagesEnabled()}
                                />
                                <label>Enable Private messages</label>
                            </div>
                        </div>
                        <div className="field">
                            <div className="ui checkbox">
                                <input
                                    type="checkbox"
                                    checked={page.getIn(['settings', 'posts_enabled'])}
                                    onChange={() => actions.togglePostsEnabled()}
                                />
                                <label>Enable posts on the page</label>
                            </div>
                        </div>
                        <div className="field">
                            <div className="ui checkbox" style={isUpdate ? {display: 'none'} : {}}>
                                <input
                                    type="checkbox"
                                    checked={page.getIn(['settings', 'import_history_enabled'])}
                                    onChange={() => actions.toggleImportHistoryEnabled()}
                                />
                                <label>Import history from the last 30 days as closed tickets</label>
                            </div>
                        </div>

                        <a
                            style={!isUpdate ? {display: 'none'} : {}}
                            onClick={this._disable}
                        >
                            Disable this page
                        </a>
                    </div>
                </div>

                <div className="sixteen wide column">
                    <span
                        className={classNames(submitButtonClassNames)}
                        onClick={() => {
                            if (!loading.get('updateIntegration')) {
                                actions.updateOrCreateIntegration(integration, 'onboard')
                            }
                        }}
                    >
                        {isUpdate ? 'Save changes' : 'Add page'}
                    </span>
                </div>
            </div>
        )
    }
}

FacebookPageDetail.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
    loading: PropTypes.object.isRequired
}

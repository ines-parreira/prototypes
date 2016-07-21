import React, {PropTypes} from 'react'
import { browserHistory } from 'react-router'

export default class FacebookPageSettings extends React.Component {
    disable = () => {
        if (window.confirm('Are you sure you want to disable this integration?')) {
            this.props.actions.deactivateIntegration(this.props.integration)
        }
    }

    render() {
        const {actions, integration} = this.props
        const page = integration.get('facebook');

        if (!page) {
            return null
        }

        // Are we defining the settings for a new page or updating an existing one?
        const isUpdate = !integration.get('deactivated_datetime')

        return (
            <div className="ui grid FacebookPageSettingsView">
                <div className="sixteen wide column">

                    <div className="ui large breadcrumb">
                        <a className="section" onClick={() => browserHistory.push('/app/settings/integrations')}>Integrations</a>
                        <i className="right angle icon divider"/>
                        <a className="section">Facebook</a>
                        <i className="right angle icon divider"/>
                        <a className="active section">{isUpdate ? page.get('name') : 'Add page'}</a>
                    </div>

                    <h1>{integration.getIn(['facebook', 'name'])}</h1>
                    <div>Choose when you want Facebook to create tickets in Gorgias.</div>

                </div>

                <div className="sixteen wide column">
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
                            onClick={this.disable}
                        >
                            Disable this page
                        </a>
                    </div>
                </div>

                <div className="sixteen wide column">
                    <span
                        className="ui green button"
                        style={!isUpdate ? {display: 'none'} : {}}
                        onClick={() => actions.updateOrCreateIntegration(integration, 'onboard')}
                    >
                        SAVE CHANGES
                    </span>
                    <span
                        className="ui green button"
                        style={isUpdate ? {display: 'none'} : {}}
                        onClick={() => actions.updateOrCreateIntegration(integration, 'onboard')}
                    >
                        ADD PAGE
                    </span>
                </div>

            </div>
        )
    }
}


FacebookPageSettings.propTypes = {
    integration: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

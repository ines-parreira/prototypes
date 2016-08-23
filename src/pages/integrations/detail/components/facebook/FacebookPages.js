import React, {PropTypes} from 'react'
import FacebookPage from './FacebookPage'
import { Link } from 'react-router'


export default class FacebookPages extends React.Component {
    render() {
        // We still use integrations as this is the most generic object.
        const {facebookIntegrations, actions} = this.props

        return (
            <div className="ui grid FacebookPagesView">
                <div className="sixteen wide column">
                    <div className="ui large breadcrumb">
                        <Link to="/app/settings/integrations">Integrations</Link>
                        <i className="right angle icon divider"/>
                        <Link to="/app/settings/integrations/facebook" className="section">Facebook</Link>
                        <i className="right angle icon divider"/>
                        <a className="active section">Add page</a>
                    </div>
                </div>
                <div className="sixteen wide column">
                    Choose the Facebook page you want to connect:
                </div>

                <div className="sixteen wide column">

                    <table className="ui very basic selectable padded table">
                        <tbody>
                        {
                            facebookIntegrations.valueSeq().map((p) => {
                                const existing = !p.get('deactivated_datetime')
                                return (
                                    <FacebookPage
                                        key={p.get('id')}
                                        facebookIntegration={p}
                                        actions={actions}
                                        onClick={() => (!existing ? actions.updateIntegration('facebook', p.get('id')) : window.alert('This page is already integrated with Gorgias'))}
                                    />
                                )
                            }
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}


FacebookPages.propTypes = {
    facebookIntegrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired
}

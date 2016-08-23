import React, {PropTypes} from 'react'
import IntegrationsSummaryRow from './IntegrationsSummaryRow'
import WrapInFacebookLogin from '../../detail/components/facebook/WrapInFacebookLogin'

class IntegrationsSummary extends React.Component {
    render() {
        const {integrationsSummary, actions, typeToLoadingStatus} = this.props

        // A map from type to the action that will be on the connect button
        const typeToOnClickConnect = {facebook: actions.facebookLogin}

        return (
            <div className="IntegrationsSummaryView">
                <div className="ui grid">
                    <div className="ui sixteen wide column">
                        <h1>Integrations</h1>
                        <div>
                            Gorgias is most useful when you connect it to other applications. Integrations let you
                            communicate with customers through multiple channels, pull more information about them
                            and perform actions in outside tools directly from Gorgias.
                        </div>

                        <table className="ui very basic padded table">
                            <tbody>
                            {
                                integrationsSummary.map((c) => (
                                    <IntegrationsSummaryRow
                                        key={c.get('type')}
                                        integrationType={c}
                                        onClickConnect={typeToOnClickConnect[c.get('type')]}
                                        loading={typeToLoadingStatus[c.get('type')]}
                                    />
                                ))
                            }
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}


IntegrationsSummary.propTypes = {
    integrationsSummary: PropTypes.object.isRequired, // A list of possible integrations
    actions: PropTypes.object.isRequired,
    typeToLoadingStatus: PropTypes.object.isRequired // A map integration type -> loading status to show loaders, etc.
}

// eslint-disable-next-line no-class-assign
export default IntegrationsSummary = WrapInFacebookLogin(IntegrationsSummary)

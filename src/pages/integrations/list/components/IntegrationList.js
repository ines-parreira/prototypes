import React, {PropTypes} from 'react'
import IntegrationListRow from './IntegrationListRow'
import {getIntegrationsList} from '../../../../state/integrations/utils'
import WrapInFacebookLogin from '../../detail/components/facebook/WrapInFacebookLogin'

class IntegrationList extends React.Component {
    _isLoading(type) {
        const integrations = this.props.integrations
        const loaders = {
            facebook: integrations.getIn(['state', 'loading', 'facebookLogin'])
        }
        return loaders[type]
    }

    render() {
        const {
            integrations,
            actions
        } = this.props

        // A map from type to the action that will be on the connect button
        const typeToOnClickAdd = {
            facebook: () => actions.facebookLogin()
        }

        const list = getIntegrationsList(integrations.get('integrations'))

        return (
            <div className="IntegrationsListView">
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
                                list.map((c) => (
                                    <IntegrationListRow
                                        key={c.get('type')}
                                        integrationType={c}
                                        onClickAdd={typeToOnClickAdd[c.get('type')]}
                                        isLoading={this._isLoading(c.get('type'))}
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

IntegrationList.propTypes = {
    facebookAppId: PropTypes.string,
    integrations: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
}

// eslint-disable-next-line no-class-assign
export default IntegrationList = WrapInFacebookLogin(IntegrationList)

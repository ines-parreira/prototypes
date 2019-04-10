import React from 'react'
import PropTypes from 'prop-types'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'

import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import * as integrationsActions from '../../../../../state/integrations/actions'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class ChatIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        activate: PropTypes.func.isRequired,
        deactivate: PropTypes.func.isRequired,
    }

    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <span>
                Live chat with your customers by adding our Chat widget on your website.
                Every time a customer starts a conversation on your website, it opens a ticket in Gorgias.
            </span>
        )

        const integrationToItemDisplay = (int) => {
            const toggleIntegration = (value) => {
                const integrationId = int.get('id')
                return value ? this.props.activate(integrationId) : this.props.deactivate(integrationId)
            }

            const editLink = `/app/settings/integrations/smooch_inside/${int.get('id')}/appearance`
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{int.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                        />
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch_inside"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter((v) => v.get('type') === 'smooch_inside')}
                createIntegration={() => browserHistory.push('/app/settings/integrations/smooch_inside/new')}
                createIntegrationButtonContent="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

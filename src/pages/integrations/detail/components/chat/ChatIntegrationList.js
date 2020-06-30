// @flow
import React from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {type List, type Map} from 'immutable'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../constants/integration'
import * as integrationsActions from '../../../../../state/integrations/actions'

import ToggleButton from '../../../../common/components/ToggleButton'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<*, *>>,
    loading: Map<*, *>,
    activate: (number) => void,
    deactivate: (number) => void,
}

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class ChatIntegrationList extends React.Component<Props> {
    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <span>
                Live chat with your customers by adding our Chat widget on your
                website. Every time a customer starts a conversation on your
                website, it opens a ticket in Gorgias.
            </span>
        )

        const integrationToItemDisplay = (integration: Map<*, *>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId = integration.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const editLink = `/app/settings/integrations/smooch_inside/${integration.get(
                'id'
            )}/appearance`
            const isDisabled = integration.get('deactivated_datetime')

            const isLoading =
                loading.get('updateIntegration') === integration.get('id')

            return (
                <tr key={integration.get('id')}>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                            loading={isLoading}
                            disabled={!!loading.get('updateIntegration')}
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
                integrationType={SMOOCH_INSIDE_INTEGRATION_TYPE}
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter(
                    (integration) =>
                        integration.get('type') ===
                        SMOOCH_INSIDE_INTEGRATION_TYPE
                )}
                createIntegration={() =>
                    browserHistory.push(
                        '/app/settings/integrations/smooch_inside/new'
                    )
                }
                createIntegrationButtonContent="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

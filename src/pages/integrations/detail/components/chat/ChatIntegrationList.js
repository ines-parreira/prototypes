import React, {PropTypes} from 'react'
import {Link, browserHistory} from 'react-router'
import {connect} from 'react-redux'
import {Button} from 'reactstrap'

import ToggleCheckbox from '../../../../common/forms/ToggleCheckbox'
import IntegrationList from '../IntegrationList'
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

            const editLink = `/app/integrations/smooch_inside/${int.get('id')}`
            const isLoading = int.get('id') === loading.get('delete')
            const isDisabled = int.get('deactivated_datetime')

            return (
                <tr key={int.get('id')}>
                    <td className="align-middle">
                        <Link to={editLink}>
                            <b>{int.get('name')}</b>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ToggleCheckbox
                            input={{
                                onChange: toggleIntegration,
                                value: !isDisabled,
                            }}
                        />
                    </td>
                    <td className="smallest">
                        <div className="pull-right">
                            <Button
                                tag={Link}
                                color="info"
                                className="mr-2"
                                disabled={isLoading}
                                to={editLink}
                            >
                                Edit
                            </Button>
                        </div>
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType="smooch_inside"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter((v) => v.get('type') === 'smooch_inside')}
                createIntegration={() => browserHistory.push('/app/integrations/smooch_inside/new')}
                createIntegrationButtonText="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

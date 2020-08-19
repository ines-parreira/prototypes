import React from 'react'
import PropTypes from 'prop-types'
import {browserHistory} from 'react-router'
import {connect} from 'react-redux'

import IntegrationList from '../IntegrationList'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'

import AircallIntegrationListItem from './AircallIntegrationListItem'

@connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})
export default class AircallIntegrationList extends React.Component {
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
                Aircall is a phone app that helps you set up a call center in
                minutes. Connect Aircall to Gorgias and create tickets when
                customers call you.
            </span>
        )

        const integrationToItemDisplay = (int) => {
            return (
                <AircallIntegrationListItem
                    key={int.get('id')}
                    activate={this.props.activate}
                    deactivate={this.props.deactivate}
                    integration={int}
                />
            )
        }

        return (
            <IntegrationList
                integrationType="aircall"
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter(
                    (v) => v.get('type') === 'aircall'
                )}
                createIntegration={() =>
                    browserHistory.push(
                        '/app/settings/integrations/aircall/new'
                    )
                }
                createIntegrationButtonContent="Connect Aircall"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

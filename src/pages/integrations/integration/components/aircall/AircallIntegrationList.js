import React from 'react'
import PropTypes from 'prop-types'

import IntegrationList from '../IntegrationList.tsx'
import history from '../../../../history.ts'

import AircallIntegrationListItem from './AircallIntegrationListItem.tsx'

export default class AircallIntegrationList extends React.Component {
    static propTypes = {
        integrations: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
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

        const integrationToItemDisplay = (integration) => {
            return (
                <AircallIntegrationListItem
                    key={integration.get('id')}
                    integration={integration.toJS()}
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
                    history.push('/app/settings/integrations/aircall/new')
                }
                createIntegrationButtonLabel="Connect Aircall"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

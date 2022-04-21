import React, {Component} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import _truncate from 'lodash/truncate'

import * as integrationsActions from 'state/integrations/actions'
import {IntegrationType} from 'models/integration/constants'

import ToggleInput from '../../../../common/forms/ToggleInput'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import history from '../../../../history'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

export class HTTPIntegrationList extends Component<Props> {
    render() {
        const {integrations, loading} = this.props
        const longTypeDescription = (
            <div>
                <p>
                    HTTP integrations allow you to connect any application to
                    Gorgias. For example, when a customer creates a ticket, you
                    can fetch their last orders from your back-office app, and
                    display them next to the ticket.
                </p>
                <p>
                    <a
                        href="https://docs.gorgias.com/data-and-http-integrations/http-integrations"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Learn more
                    </a>{' '}
                    about how to connect apps in our docs, or contact our
                    support through the chat.
                </p>
            </div>
        )

        const integrationToItemDisplay = (int: Map<any, any>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId: number = int.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const isDisabled = int.get('deactivated_datetime')

            const editLink = `/app/settings/integrations/http/${
                int.get('id') as string
            }`

            return (
                <tr key={int.get('id')}>
                    <td className="smallest align-middle">
                        <ToggleInput
                            isToggled={!isDisabled}
                            onClick={toggleIntegration}
                        />
                    </td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b className="mr-2">{int.get('name')}</b>
                                <span className="text-faded d-none d-md-inline">
                                    {_truncate(int.get('description'), {
                                        length: 100,
                                    })}
                                </span>
                            </div>
                        </Link>
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                integrationType={IntegrationType.Http}
                integrations={
                    integrations.filter(
                        (v) => v!.get('type') === 'http'
                    ) as List<Map<any, any>>
                }
                longTypeDescription={longTypeDescription}
                createIntegration={() =>
                    history.push('/app/settings/integrations/http/new')
                }
                createIntegrationButtonContent="Add HTTP integration"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

const connector = connect(null, {
    activate: integrationsActions.activateIntegration,
    deactivate: integrationsActions.deactivateIntegration,
})

export default connector(HTTPIntegrationList)

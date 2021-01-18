import React from 'react'

import {List} from 'immutable'
import {Link} from 'react-router-dom'

import {Button} from 'reactstrap'

import IntegrationList from '../IntegrationList.js'
import ForwardIcon from '../ForwardIcon.js'
import {YOTPO_INTEGRATION_TYPE} from '../../../../../constants/integration'

interface IActions {
    activateIntegration: (i: string | undefined) => void
}

interface IReceivedProps {
    integrations: List<Map<string, string>>
    loading: Map<string, string>
    redirectUri: Location
}

export default class YotpoIntegrationList extends React.Component<
    IReceivedProps
> {
    render(): JSX.Element {
        const {integrations, loading} = this.props
        const isSubmitting = loading.get('updateIntegration')

        const yotpoIntegrations = integrations.filter(
            (v) => v?.get('type') === YOTPO_INTEGRATION_TYPE
        )

        const longTypeDescription = (
            <div>
                <p>
                    Yotpo is a user-generated content tool for merchants. It
                    includes customer reviews, visual marketing, loyalty, and
                    referrals.
                </p>
                <p>Integration benefits:</p>

                <ul>
                    <li>
                        Respond from Gorgias to Yotpo reviews under a certain
                        rating (e.g. negative reviews), shoppers questions, past
                        buyers answers, reviews picked up by profanity detectors
                    </li>
                    <li>
                        Display relevant customer information in custom Gorgias
                        widget
                    </li>
                    <li>Display latest reviews from customers in the widget</li>
                </ul>

                <h4>Your Yotpo integrations</h4>
            </div>
        )

        const integrationToItemDisplay = (integration: Map<string, string>) => {
            const isDisabled = integration.get('deactivated_datetime')
            const integrationId = integration.get('id')
            const editLink = `/app/settings/integrations/yotpo/${
                integrationId ? integrationId : ''
            }`

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
                        {isDisabled && (
                            <Button
                                type="button"
                                color="success"
                                onClick={() =>
                                    (window.location = this.props.redirectUri)
                                }
                                disabled={!!isSubmitting}
                            >
                                Reconnect integration
                            </Button>
                        )}
                    </td>
                    <td className="smallest align-middle">
                        <ForwardIcon href={editLink} />
                    </td>
                </tr>
            )
        }

        return (
            <IntegrationList
                longTypeDescription={longTypeDescription}
                integrationType="yotpo"
                integrations={yotpoIntegrations}
                createIntegration={() =>
                    (window.location = this.props.redirectUri)
                }
                createIntegrationButtonContent="Add Yotpo account"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

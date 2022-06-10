import React, {Component} from 'react'
import {List, Map} from 'immutable'
import {Link} from 'react-router-dom'
import {Button} from 'reactstrap'

import {IntegrationType} from 'models/integration/types'

import IntegrationList from '../IntegrationList'
import ForwardIcon from '../../../common/components/ForwardIcon'

type IReceivedProps = {
    integrations: List<Map<string, string>>
    loading: Map<any, any>
    redirectUri: string
}

export default class YotpoIntegrationList extends Component<IReceivedProps> {
    render(): JSX.Element {
        const {integrations, loading} = this.props
        const isSubmitting = loading.get('updateIntegration')

        const yotpoIntegrations = integrations.filter(
            (v) => v?.get('type') === IntegrationType.Yotpo
        ) as List<Map<any, any>>

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
                                    (window.location.href =
                                        this.props.redirectUri)
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
                integrationType={IntegrationType.Yotpo}
                integrations={yotpoIntegrations}
                createIntegration={() =>
                    (window.location.href = this.props.redirectUri)
                }
                createIntegrationButtonLabel="Add Yotpo account"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

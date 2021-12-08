import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import {List, Map} from 'immutable'

import {
    activateIntegration,
    deactivateIntegration,
} from '../../../../../state/integrations/actions'
import ToggleButton from '../../../../common/components/ToggleButton'
import Alert, {AlertType} from '../../../../common/components/Alert/Alert'
import history from '../../../../history'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import {IntegrationType} from '../../../../../models/integration/types'
import css from '../../../../settings/settings.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
} & ConnectedProps<typeof connector>

export class ChatIntegrationListContainer extends Component<Props> {
    render() {
        const {integrations, loading} = this.props
        const hasActiveSmoochInsideIntegration = integrations.find(
            (integration) =>
                integration!.get('type') === IntegrationType.SmoochInside &&
                integration!.get('deactivated_datetime') == null
        )

        const longTypeDescription = () => {
            return (
                <div>
                    {hasActiveSmoochInsideIntegration ? (
                        <Alert type={AlertType.Error} icon className={css.mb16}>
                            A{' '}
                            <Link to="/app/settings/integrations/gorgias_chat">
                                new version of the chat
                            </Link>{' '}
                            with additional features is available, please
                            migrate to the new version by following the steps
                            outlined in{' '}
                            <a
                                href="https://docs.gorgias.com/gorgias-chat/migrating-to-new-chat-integration-beta-version"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                this article
                            </a>
                            . On 03/31, any remaining active integrations will
                            be automatically removed.
                        </Alert>
                    ) : null}
                    <span>
                        Live chat with your customers by adding our Chat widget
                        on your website. Every time a customer starts a
                        conversation on your website, it opens a ticket in
                        Gorgias.
                    </span>
                </div>
            )
        }

        const integrationToItemDisplay = (integration: Map<any, any>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId = integration.get('id') as number
                if (value) {
                    this.props.activate(integrationId)
                } else {
                    this.props.deactivate(integrationId)
                }
            }

            const editLink = `/app/settings/integrations/smooch_inside/${
                integration.get('id') as number
            }/migration`
            const isDisabled = integration.get('deactivated_datetime')

            const isLoading =
                loading.get('updateIntegration') === integration.get('id')

            return (
                <tr key={integration.get('id')}>
                    <td className="smallest align-middle">
                        <ToggleButton
                            value={!isDisabled}
                            onChange={toggleIntegration}
                            loading={isLoading}
                            disabled={!!loading.get('updateIntegration')}
                        />
                    </td>
                    <td className="link-full-td">
                        <Link to={editLink}>
                            <div>
                                <b>{integration.get('name')}</b>
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
                integrationType={IntegrationType.SmoochInside}
                longTypeDescription={longTypeDescription()}
                integrations={
                    integrations.filter(
                        (integration) =>
                            integration!.get('type') ===
                            IntegrationType.SmoochInside
                    ) as List<Map<any, any>>
                }
                createIntegration={() =>
                    history.push('/app/settings/integrations/smooch_inside/new')
                }
                createIntegrationButtonContent="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

const connector = connect(null, {
    activate: activateIntegration,
    deactivate: deactivateIntegration,
})

export default connector(ChatIntegrationListContainer)

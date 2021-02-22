// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {type List, type Map} from 'immutable'
import Alert from 'reactstrap/lib/Alert'

import {SMOOCH_INSIDE_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'

import ToggleButton from '../../../../common/components/ToggleButton'
import history from '../../../../history.ts'
import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'
import {notify} from '../../../../../state/notifications/actions.ts'
import {store} from '../../../../../init.ts'

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
        const hasActiveSmoochInsideIntegration = integrations.find(
            (integration) =>
                integration.get('type') === SMOOCH_INSIDE_INTEGRATION_TYPE &&
                integration.get('deactivated_datetime') == null
        )

        const longTypeDescription = () => {
            return (
                <div>
                    {hasActiveSmoochInsideIntegration ? (
                        <Alert color="warning">
                            <span role="img" aria-label="warning">
                                ⚠️
                            </span>{' '}
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
                            .
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

        const integrationToItemDisplay = (integration: Map<*, *>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId = integration.get('id')
                if (value) {
                    store.dispatch(
                        notify({
                            status: 'error',
                            message:
                                'This version of the chat is no longer supported. Please using the new chat integration to add chat to your online store.',
                        })
                    )
                } else {
                    this.props.deactivate(integrationId)
                }
            }

            const editLink = `/app/settings/integrations/smooch_inside/${integration.get(
                'id'
            )}/migration`
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
                longTypeDescription={longTypeDescription()}
                integrations={integrations.filter(
                    (integration) =>
                        integration.get('type') ===
                        SMOOCH_INSIDE_INTEGRATION_TYPE
                )}
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

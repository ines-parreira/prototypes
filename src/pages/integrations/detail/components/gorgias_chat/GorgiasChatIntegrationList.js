// @flow
import React from 'react'
import {Link} from 'react-router-dom'
import {connect} from 'react-redux'
import {type List, type Map} from 'immutable'
import Alert from 'reactstrap/lib/Alert'

import {GORGIAS_CHAT_INTEGRATION_TYPE} from '../../../../../constants/integration.ts'
import * as integrationsActions from '../../../../../state/integrations/actions.ts'

import ToggleButton from '../../../../common/components/ToggleButton'
import history from '../../../../history.ts'
import ForwardIcon from '../ForwardIcon'
import IntegrationList from '../IntegrationList'

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
export default class GorgiasChatIntegrationList extends React.Component<Props> {
    render() {
        const {integrations, loading} = this.props

        const longTypeDescription = (
            <div>
                <Alert color="success">
                    <span role="img" aria-label="white check mark">
                        ✅
                    </span>{' '}
                    Welcome to our new, remodeled chat integration. We've made
                    significant improvements to the back-end, it's faster and
                    lighter and has new features like customer location with
                    more to come very soon. Note that, if you're migrating from
                    our legacy chat, you will need to follow the steps outlined
                    in this article.{' '}
                    <a
                        href="https://portal.productboard.com/gorgias/1-gorgias-product-roadmap/c/79-chatbot-self-service-flows-to-automate-50-of-tickets"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        We'll be adding more features very soon!
                    </a>
                </Alert>
                <span>
                    Live chat with your customers by adding our Chat widget on
                    your website. Every time a customer starts a conversation on
                    your website, it opens a ticket in Gorgias.
                </span>
            </div>
        )

        const integrationToItemDisplay = (integration: Map<*, *>) => {
            const toggleIntegration = (value: boolean) => {
                const integrationId = integration.get('id')
                return value
                    ? this.props.activate(integrationId)
                    : this.props.deactivate(integrationId)
            }

            const editLink = `/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}/${integration.get(
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
                integrationType={GORGIAS_CHAT_INTEGRATION_TYPE}
                longTypeDescription={longTypeDescription}
                integrations={integrations.filter(
                    (integration) =>
                        integration.get('type') ===
                        GORGIAS_CHAT_INTEGRATION_TYPE
                )}
                createIntegration={() =>
                    history.push(
                        `/app/settings/integrations/${GORGIAS_CHAT_INTEGRATION_TYPE}/new`
                    )
                }
                createIntegrationButtonContent="Add chat"
                integrationToItemDisplay={integrationToItemDisplay}
                loading={loading}
            />
        )
    }
}

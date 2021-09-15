import React from 'react'

import {Link} from 'react-router-dom'
import {List, Map} from 'immutable'

import {IntegrationType} from '../../../../../models/integration/types'

import history from '../../../../history'

import IntegrationList from '../IntegrationList'
import ForwardIcon from '../ForwardIcon'

type Props = {
    integrations: List<Map<string, unknown>>
    loading: Map<string, string>
}

const KlaviyoIntegrationList = (props: Props) => {
    const {integrations, loading} = props
    const longTypeDescription = (
        <div>
            <p>
                Klaviyo is an email marketing platform for creating, managing
                and measuring every email a business sends.
            </p>
        </div>
    )
    const integrationToItemDisplay = (integration: Map<string, string>) => {
        const isDeactivated = integration.get('deactivated_datetime')
        const integrationId = integration.get('id')

        const editLink = `/app/settings/integrations/klaviyo/${
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
                {isDeactivated ? (
                    <td className="smallest align-middle p-0">
                        <div>
                            <i className={'material-icons mr-2 red'}>close</i>
                            Deactivated
                        </div>
                    </td>
                ) : (
                    <td></td>
                )}

                <td></td>
                <td className="smallest align-middle">
                    <ForwardIcon href={editLink} />
                </td>
            </tr>
        )
    }
    return (
        <IntegrationList
            longTypeDescription={longTypeDescription}
            integrationType={IntegrationType.KlaviyoIntegrationType}
            integrations={
                integrations.filter(
                    (item) =>
                        item?.get('type') ===
                        IntegrationType.KlaviyoIntegrationType
                ) as List<Map<any, any>>
            }
            createIntegration={() => {
                history.push('/app/settings/integrations/klaviyo/new')
            }}
            createIntegrationButtonContent="Add Klaviyo Integration"
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}

export default KlaviyoIntegrationList

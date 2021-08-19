import React from 'react'
import {Link} from 'react-router-dom'
import {List, Map} from 'immutable'

import ToggleButton from '../../../../common/components/ToggleButton'
import history from '../../../../history'
import ForwardIcon from '../ForwardIcon'
import IntegrationList from '../IntegrationList.js'
import shopifyLogo from '../../../../../../img/integrations/shopify.png'
import warningIcon from '../../../../../../img/icons/warning.svg'
import Tooltip from '../../../../common/components/Tooltip'
import {IntegrationType} from '../../../../../models/integration/types'

import css from './GorgiasChatIntegrationList.less'

type Props = {
    integrations: List<Map<any, any>>
    loading: Map<any, any>
    actions: {
        activateIntegration: (id: number) => unknown
        deactivateIntegration: (id: number) => unknown
    }
}

function GorgiasChatIntegrationList({
    integrations,
    loading,
    actions: {activateIntegration, deactivateIntegration},
}: Props) {
    const longTypeDescription = (
        <div>
            Live chat with your customers by adding our Chat widget on your
            website. Every time a customer starts a conversation on your
            website, it opens a ticket in Gorgias.
        </div>
    )

    const integrationToItemDisplay = (integration: Map<any, any>) => {
        const integrationId: number = integration.get('id')
        const toggleIntegration = (value: boolean) => {
            value
                ? activateIntegration(integrationId)
                : deactivateIntegration(integrationId)

            return null
        }

        const editLink = `/app/settings/integrations/${
            IntegrationType.GorgiasChatIntegrationType
        }/${integration.get('id') as string}/appearance`
        const isDisabled = integration.get('deactivated_datetime')
        const isLoading = loading.get('updateIntegration') === integrationId
        const shopifyStoreName: string = integration.getIn([
            'meta',
            'shop_name',
        ])
        const shopifyStore: Map<any, any> = integrations.find(
            (_integration) =>
                _integration?.get('name') === shopifyStoreName &&
                _integration?.get('type') ===
                    IntegrationType.ShopifyIntegrationType
        )
        const isStoreDisconnected =
            !shopifyStore || shopifyStore.get('deactivated_datetime')

        return (
            <tr key={integrationId}>
                <td className="link-full-td">
                    <Link to={editLink}>
                        <div className={css['integration-link-inner']}>
                            <b>{integration.get('name')}</b>
                            {shopifyStoreName && (
                                <>
                                    <span className={css['shopify-store-name']}>
                                        <img
                                            src={shopifyLogo}
                                            alt="logo Shopify"
                                        />
                                        <span>{shopifyStoreName}</span>
                                    </span>
                                    {isStoreDisconnected && (
                                        <>
                                            <img
                                                src={warningIcon}
                                                alt="warning icon"
                                                id={`store-disconnected-${integrationId}`}
                                                className={`material-icons ${css['warning-icon']}`}
                                            />
                                            <Tooltip
                                                target={`store-disconnected-${integrationId}`}
                                                placement="top"
                                            >
                                                This store is currently
                                                disconnected
                                            </Tooltip>
                                        </>
                                    )}
                                </>
                            )}
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
            integrationType={IntegrationType.GorgiasChatIntegrationType}
            longTypeDescription={longTypeDescription}
            integrations={integrations.filter(
                (integration) =>
                    integration?.get('type') ===
                    IntegrationType.GorgiasChatIntegrationType
            )}
            createIntegration={() =>
                history.push(
                    `/app/settings/integrations/${IntegrationType.GorgiasChatIntegrationType}/new`
                )
            }
            createIntegrationButtonContent={
                <div className={css['create-integration-btn']}>
                    <i className="material-icons mr-2">add</i>Add New
                </div>
            }
            integrationToItemDisplay={integrationToItemDisplay}
            loading={loading}
        />
    )
}

export default GorgiasChatIntegrationList

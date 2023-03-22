import React from 'react'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'

import Button from 'pages/common/components/button/Button'

import css from './NewGorgiasChatIntegrationOneClickInstallationCard.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    isConnected: boolean
    isInstalled: boolean
}

const GorgiasChatIntegrationOneClickInstallationCard = ({
    integration,
    updateOrCreateIntegration,
    isConnected,
    isInstalled,
}: Props) => {
    const [{loading: isUninstallPending}, handleUninstall] =
        useAsyncFn(async () => {
            const meta: Map<any, any> = integration.get('meta')

            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: meta.set('shopify_integration_ids', []),
            }

            await updateOrCreateIntegration(fromJS(form))
        }, [integration, updateOrCreateIntegration])
    const [{loading: isInstallPending}, handleInstall] =
        useAsyncFn(async () => {
            const shopIntegrationId = integration.getIn([
                'meta',
                'shop_integration_id',
            ])

            if (!shopIntegrationId) {
                return
            }

            const meta: Map<any, any> = integration.get('meta')

            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: meta.set('shopify_integration_ids', [shopIntegrationId]),
            }

            await updateOrCreateIntegration(fromJS(form))
        }, [integration, updateOrCreateIntegration])

    return (
        <div className={css.container}>
            <div>
                <div className={css.title}>
                    1-click installation for Shopify
                </div>
                <div>
                    Add the chat widget to your Shopify store in one click. Note
                    that this will automatically enable Automation Add-on
                    features if available.
                </div>
            </div>
            {isInstalled ? (
                <Button
                    intent="secondary"
                    isDisabled={isUninstallPending}
                    onClick={handleUninstall}
                >
                    Uninstall
                </Button>
            ) : (
                <Button
                    isDisabled={!isConnected || isInstallPending}
                    intent={isConnected ? 'primary' : 'secondary'}
                    onClick={handleInstall}
                >
                    Install
                </Button>
            )}
        </div>
    )
}

export default GorgiasChatIntegrationOneClickInstallationCard

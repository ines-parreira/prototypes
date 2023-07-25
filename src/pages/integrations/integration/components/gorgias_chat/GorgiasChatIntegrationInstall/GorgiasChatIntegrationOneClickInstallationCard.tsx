import React, {useRef, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import GorgiasChatIntegrationVisibilityControls, {
    GorgiasChatIntegrationVisibilityControlsHandle,
} from './GorgiasChatIntegrationVisibilityControls'

import css from './GorgiasChatIntegrationOneClickInstallationCard.less'

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
    const hasIntegrationLoaded = !!integration.get('id')

    const isShowOrHideOnSelectedUrlsEnabled =
        useFlags()[FeatureFlagKey.ChatShowOrHideOnSelectedUrls]

    const [isOpen, setIsOpen] = useState(false)

    const [isVisibilityValid, setIsVisibilityValid] = useState(true)

    const visibilityControlsRef =
        useRef<GorgiasChatIntegrationVisibilityControlsHandle>(null)

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
                meta: meta
                    .set('shopify_integration_ids', [shopIntegrationId])
                    .setIn(
                        ['installation', 'visibility'],
                        visibilityControlsRef.current?.visibility
                    ),
            }

            await updateOrCreateIntegration(fromJS(form))
        }, [integration, updateOrCreateIntegration])

    const canSubmitInstall = isConnected && !isInstallPending

    return (
        <div className={css.container}>
            <div className={css.header}>
                {isInstalled ? (
                    <i
                        className="material-icons text-success"
                        style={{fontSize: 24}}
                    >
                        check_circle
                    </i>
                ) : null}
                <div>
                    <div className={css.title}>
                        1-click installation for Shopify
                    </div>
                    <div>
                        Add the chat widget to your Shopify store in one click.
                        Note that this will automatically enable Automation
                        Add-on features if available.
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
                        isDisabled={!canSubmitInstall || !isVisibilityValid}
                        intent={isConnected ? 'primary' : 'secondary'}
                        onClick={handleInstall}
                    >
                        Install
                    </Button>
                )}
                {isShowOrHideOnSelectedUrlsEnabled && (
                    <IconButton
                        className={css.toggleCollapseButton}
                        fillStyle="ghost"
                        intent="secondary"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                    </IconButton>
                )}
            </div>
            {isShowOrHideOnSelectedUrlsEnabled && hasIntegrationLoaded && (
                <GorgiasChatIntegrationVisibilityControls
                    integration={integration}
                    open={() => setIsOpen(true)}
                    isOpen={isOpen}
                    isUpdate={isInstalled}
                    canSubmit={canSubmitInstall}
                    onValidate={setIsVisibilityValid}
                    onSubmit={handleInstall}
                    ref={visibilityControlsRef}
                />
            )}
        </div>
    )
}

export default GorgiasChatIntegrationOneClickInstallationCard

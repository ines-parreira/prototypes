import React, {useRef, useState} from 'react'
import {useAsyncFn} from 'react-use'
import {fromJS, Map} from 'immutable'
import {useFlags} from 'launchdarkly-react-client-sdk'

import {FeatureFlagKey} from 'config/featureFlags'

import Button from 'pages/common/components/button/Button'
import IconButton from 'pages/common/components/button/IconButton'

import Modal from 'pages/common/components/modal/Modal'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import {makeGetPreRedirectUri} from 'state/integrations/selectors'
import {IntegrationType} from 'models/integration/constants'
import useAppSelector from 'hooks/useAppSelector'
import GorgiasChatIntegrationVisibilityControls, {
    GorgiasChatIntegrationVisibilityControlsHandle,
} from './GorgiasChatIntegrationVisibilityControls'
import css from './GorgiasChatIntegrationOneClickInstallationCard.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    isConnected: boolean
    isInstalled: boolean
    hasShopifyScriptTagScope: boolean
}

const GorgiasChatIntegrationOneClickInstallationCard = ({
    integration,
    updateOrCreateIntegration,
    isConnected,
    isInstalled,
    hasShopifyScriptTagScope,
}: Props) => {
    const hasIntegrationLoaded = !!integration.get('id')

    const flags = useFlags()

    const isShowOrHideOnSelectedUrlsEnabled =
        flags[FeatureFlagKey.ChatShowOrHideOnSelectedUrls]

    const isInstallOnShopifyCallbackEnabled =
        flags[FeatureFlagKey.ChatScopeInstallOnShopifyCallback]

    const [isOpen, setIsOpen] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isVisibilityValid, setIsVisibilityValid] = useState(true)

    const visibilityControlsRef =
        useRef<GorgiasChatIntegrationVisibilityControlsHandle>(null)

    const getRedirectUri = useAppSelector(makeGetPreRedirectUri)

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{loading}, handleShopifyScriptTagScope] = useAsyncFn(async () => {
        if (!isInstallOnShopifyCallbackEnabled || hasShopifyScriptTagScope) {
            await handleInstall()
        } else {
            setIsModalOpen(true)
        }
    }, [handleInstall, setIsModalOpen])

    const redirectToShopifyPermissionsWithChatInstall = () => {
        const shopName = integration.getIn(['meta', 'shop_name'])
        const redirectUri = getRedirectUri(IntegrationType.Shopify, {
            install_chat_integration_id: integration.get('id'),
            shop_name: shopName,
        })
        window.location.href = redirectUri
    }

    const canSubmitInstall = isConnected && !isInstallPending

    const ShopifyScriptTagScopeModal = () => {
        return (
            <Modal
                onClose={() => setIsModalOpen(false)}
                isOpen={isModalOpen}
                container={document.getElementById('root') as Element}
            >
                <ModalHeader title="Update Shopify permissions" />
                <ModalBody>
                    Please update Shopify permissions before installing your
                    chat to ensure better stability.
                </ModalBody>
                <ModalActionsFooter>
                    <Button
                        intent="secondary"
                        onClick={() => setIsModalOpen(false)}
                    >
                        Close
                    </Button>
                    <Button
                        onClick={redirectToShopifyPermissionsWithChatInstall}
                    >
                        Update
                    </Button>
                </ModalActionsFooter>
            </Modal>
        )
    }

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
                        onClick={handleShopifyScriptTagScope}
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
                    onSubmit={handleShopifyScriptTagScope}
                    ref={visibilityControlsRef}
                />
            )}
            {isInstallOnShopifyCallbackEnabled && (
                <ShopifyScriptTagScopeModal />
            )}
        </div>
    )
}

export default GorgiasChatIntegrationOneClickInstallationCard

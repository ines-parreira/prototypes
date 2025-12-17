import { useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import IconButton from 'pages/common/components/button/IconButton'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import { updateOrCreateIntegrationRequest } from 'state/integrations/actions'
import {
    getStoreIntegrations,
    makeGetPreRedirectUri,
} from 'state/integrations/selectors'

import useShopifyThemeAppExtension from '../hooks/useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation, {
    getGorgiasMainThemeAppExtensionId,
} from '../hooks/useThemeAppExtensionInstallation'
import type { GorgiasChatIntegrationVisibilityControlsHandle } from './GorgiasChatIntegrationVisibilityControls'
import GorgiasChatIntegrationVisibilityControls from './GorgiasChatIntegrationVisibilityControls'

import css from './GorgiasChatIntegrationOneClickInstallationCard.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    themeAppExtensionInstallation: boolean
    themeAppExtensionInstallationUrl: string | null
    isConnected: boolean
    isInstalled: boolean
    hasShopifyScriptTagScope: boolean
}

const GorgiasChatIntegrationOneClickInstallationCard = ({
    integration,
    updateOrCreateIntegration,
    themeAppExtensionInstallation,
    themeAppExtensionInstallationUrl,
    isConnected,
    isInstalled,
    hasShopifyScriptTagScope,
}: Props) => {
    const hasIntegrationLoaded = !!integration.get('id')

    const dispatch = useAppDispatch()

    const isShowOrHideOnSelectedUrlsEnabled = useFlag(
        FeatureFlagKey.ChatShowOrHideOnSelectedUrls,
    )

    const isInstallOnShopifyCallbackEnabled = useFlag(
        FeatureFlagKey.ChatScopeInstallOnShopifyCallback,
    )

    const storeIntegrations = useAppSelector(getStoreIntegrations)

    const shopIntegrationId = integration.getIn(['meta', 'shop_integration_id'])

    const storeIntegration = storeIntegrations.find(
        (storeIntegration) => storeIntegration.id === shopIntegrationId,
    )
    const isStoreOfShopifyType =
        storeIntegration?.type === IntegrationType.Shopify

    const { shouldUseThemeAppExtensionInstallation } =
        useThemeAppExtensionInstallation(
            isStoreOfShopifyType ? storeIntegration : undefined,
        )

    const {
        isInstalled: isThemeAppExtensionInstalled,
        isLoaded: isThemeAppExtensionStatusLoaded,
    } = useShopifyThemeAppExtension({
        shopifyIntegration: isStoreOfShopifyType ? storeIntegration : undefined,
        appUuid: getGorgiasMainThemeAppExtensionId(),
    })

    const [isOpen, setIsOpen] = useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false)

    const [isVisibilityValid, setIsVisibilityValid] = useState(true)

    const visibilityControlsRef =
        useRef<GorgiasChatIntegrationVisibilityControlsHandle>(null)

    const getRedirectUri = useAppSelector(makeGetPreRedirectUri)

    const [{ loading: isUninstallPending }, handleUninstall] =
        useAsyncFn(async () => {
            const meta: Map<any, any> = integration.get('meta')

            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: meta.set('shopify_integration_ids', []),
            }

            await updateOrCreateIntegration(fromJS(form))
        }, [integration, updateOrCreateIntegration])

    const [wasShopifyThemeSettingsOpened, setWasShopifyThemeSettingsOpened] =
        useState(false)
    const openShopifyThemeSettingsInNewTabIfNeeded = () => {
        if (
            themeAppExtensionInstallation &&
            themeAppExtensionInstallationUrl &&
            !isThemeAppExtensionInstalled
        ) {
            setWasShopifyThemeSettingsOpened(true)
            window.open(
                themeAppExtensionInstallationUrl,
                '_blank',
                'noopener noreferrer',
            )
        }
    }

    const [{ loading: isInstallPending }, handleInstall] =
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
                        visibilityControlsRef.current?.visibility,
                    ),
            }

            await dispatch(
                updateOrCreateIntegrationRequest(
                    fromJS(form),
                    undefined,
                    null,
                    true,
                    openShopifyThemeSettingsInNewTabIfNeeded,
                ),
            )
        }, [
            integration,
            updateOrCreateIntegration,
            openShopifyThemeSettingsInNewTabIfNeeded,
        ])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ loading }, handleShopifyScriptTagScope] = useAsyncFn(async () => {
        if (!isInstallOnShopifyCallbackEnabled || hasShopifyScriptTagScope) {
            await handleInstall()
        } else {
            setIsModalOpen(true)
        }
    }, [handleInstall, setIsModalOpen])

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [{ loading: reinstallLoading }, handleReinstall] =
        useAsyncFn(async () => {
            if (
                !isInstallOnShopifyCallbackEnabled ||
                hasShopifyScriptTagScope
            ) {
                await handleUninstall()
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

    const renderCardSubtext = () => {
        if (!themeAppExtensionInstallation) {
            return (
                <div>
                    Add the chat widget to your Shopify store in one click.
                </div>
            )
        }

        if (!isThemeAppExtensionInstalled && !isInstalled) {
            return (
                <div>
                    To add Chat, click Install then Save in the new Shopify
                    window without editing anything.
                </div>
            )
        }

        if (isThemeAppExtensionInstalled && !isInstalled) {
            return <div>To add Chat to your Shopify store, click Install.</div>
        }

        if (!isThemeAppExtensionInstalled && isInstalled) {
            return (
                <div>
                    To add Chat, click Reinstall then Save in the new Shopify
                    window without editing anything.
                </div>
            )
        }

        return <div>To add Chat to your Shopify store, click Install.</div>
    }

    const renderCardButton = () => {
        if (
            shouldUseThemeAppExtensionInstallation &&
            !isThemeAppExtensionInstalled &&
            isInstalled &&
            !wasShopifyThemeSettingsOpened
        ) {
            return (
                <Button
                    isDisabled={!canSubmitInstall || !isVisibilityValid}
                    intent={'primary'}
                    onClick={handleReinstall}
                >
                    Reinstall
                </Button>
            )
        }

        if (!isInstalled) {
            return (
                <Button
                    isDisabled={!canSubmitInstall || !isVisibilityValid}
                    intent={isConnected ? 'primary' : 'secondary'}
                    onClick={handleShopifyScriptTagScope}
                >
                    Install
                </Button>
            )
        }

        return (
            <Button
                intent="secondary"
                isDisabled={isUninstallPending}
                onClick={handleUninstall}
            >
                Uninstall
            </Button>
        )
    }

    if (
        themeAppExtensionInstallation &&
        !isThemeAppExtensionStatusLoaded &&
        isThemeAppExtensionInstalled === undefined
    ) {
        return (
            <div className={css.container}>
                <SkeletonLoader length={1} />
            </div>
        )
    }

    return (
        <div className={css.container}>
            <div className={css.header}>
                <div className={css.leftSection}>
                    {isInstalled ? (
                        <div className={css.installedIcon}>
                            <i
                                className="material-icons text-success"
                                style={{ fontSize: 24 }}
                            >
                                check_circle
                            </i>
                        </div>
                    ) : null}
                    <div>
                        {themeAppExtensionInstallation ? (
                            <div className={css.title}>
                                Quick installation for Shopify
                            </div>
                        ) : (
                            <div className={css.title}>
                                1-click installation for Shopify
                            </div>
                        )}

                        {renderCardSubtext()}
                    </div>
                </div>
                <div className={css.rightSection}>
                    {renderCardButton()}
                    {isShowOrHideOnSelectedUrlsEnabled && (
                        <IconButton
                            className={css.toggleCollapseButton}
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            {isOpen
                                ? 'keyboard_arrow_up'
                                : 'keyboard_arrow_down'}
                        </IconButton>
                    )}
                </div>
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

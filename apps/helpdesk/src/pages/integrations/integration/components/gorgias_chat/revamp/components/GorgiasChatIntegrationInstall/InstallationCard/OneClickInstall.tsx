import { useCallback, useMemo, useRef, useState } from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { useAsyncFn } from '@repo/hooks'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import {
    Button,
    ButtonIntent,
    ButtonVariant,
    Icon,
    IconName,
    IconSize,
    Modal,
    ModalSize,
    OverlayContent,
    OverlayFooter,
    OverlayHeader,
    Text,
    TextSize,
    TextVariant,
} from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/constants'
import SkeletonLoader from 'pages/common/components/SkeletonLoader'
import useShopifyThemeAppExtension from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useShopifyThemeAppExtension'
import useThemeAppExtensionInstallation, {
    getGorgiasMainThemeAppExtensionId,
} from 'pages/integrations/integration/components/gorgias_chat/legacy/hooks/useThemeAppExtensionInstallation'
import type { VisibilityControlsHandle } from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/InstallationCard/VisibilityControls'
import VisibilityControls from 'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationInstall/InstallationCard/VisibilityControls'
import { updateOrCreateIntegrationRequest } from 'state/integrations/actions'
import {
    getStoreIntegrations,
    makeGetPreRedirectUri,
} from 'state/integrations/selectors'

import css from './OneClickinstall.less'

type Props = {
    integration: Map<any, any>
    updateOrCreateIntegration: (integration: Map<any, any>) => Promise<void>
    themeAppExtensionInstallation: boolean
    themeAppExtensionInstallationUrl: string | null
    isConnected: boolean
    isInstalled: boolean
    hasShopifyScriptTagScope: boolean
}

const OneClickInstall = ({
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

    const visibilityControlsRef = useRef<VisibilityControlsHandle>(null)

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

    const [
        { loading: __shopifyScriptTagScopeLoading },
        handleShopifyScriptTagScope,
    ] = useAsyncFn(async () => {
        if (!isInstallOnShopifyCallbackEnabled || hasShopifyScriptTagScope) {
            await handleInstall()
        } else {
            setIsModalOpen(true)
        }
    }, [handleInstall, setIsModalOpen])

    const [{ loading: __reinstallLoading }, handleReinstall] =
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

    const redirectToShopifyPermissionsWithChatInstall = useCallback(() => {
        const shopName = integration.getIn(['meta', 'shop_name'])
        const redirectUri = getRedirectUri(IntegrationType.Shopify, {
            install_chat_integration_id: integration.get('id'),
            shop_name: shopName,
        })
        window.location.href = redirectUri
    }, [integration, getRedirectUri])

    const canSubmitInstall = isConnected && !isInstallPending

    const shopifyScriptTagScopeModal = useMemo(() => {
        return (
            <Modal
                size={ModalSize.Md}
                isOpen={isModalOpen}
                onOpenChange={(isOpen) => setIsModalOpen(isOpen)}
            >
                <OverlayHeader title="Update Shopify permissions?" />
                <OverlayContent>
                    <div>
                        <Text>
                            Please update Shopify permissions before installing
                            your chat to ensure better stability.
                        </Text>
                    </div>
                </OverlayContent>
                <OverlayFooter hideCancelButton>
                    <div className={css.modalFooter}>
                        <Button
                            intent={ButtonIntent.Regular}
                            variant={ButtonVariant.Secondary}
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </Button>
                        <Button
                            onClick={
                                redirectToShopifyPermissionsWithChatInstall
                            }
                        >
                            Update
                        </Button>
                    </div>
                </OverlayFooter>
            </Modal>
        )
    }, [isModalOpen, redirectToShopifyPermissionsWithChatInstall])

    const renderCardSubtext = () => {
        if (!themeAppExtensionInstallation) {
            return (
                <Text>
                    Add the chat widget to your Shopify store in one click.
                </Text>
            )
        }

        if (!isThemeAppExtensionInstalled && !isInstalled) {
            return (
                <Text>
                    To add Chat, click Install then Save in the new Shopify
                    window without editing anything.
                </Text>
            )
        }

        if (isThemeAppExtensionInstalled && !isInstalled) {
            return (
                <Text>To add Chat to your Shopify store, click Install.</Text>
            )
        }

        if (!isThemeAppExtensionInstalled && isInstalled) {
            return (
                <Text>
                    To add Chat, click Reinstall then Save in the new Shopify
                    window without editing anything.
                </Text>
            )
        }

        return <Text>To add Chat to your Shopify store, click Install.</Text>
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
                    intent={ButtonIntent.Regular}
                    variant={
                        isConnected
                            ? ButtonVariant.Primary
                            : ButtonVariant.Secondary
                    }
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
                    intent={ButtonIntent.Regular}
                    variant={
                        isConnected
                            ? ButtonVariant.Primary
                            : ButtonVariant.Secondary
                    }
                    onClick={handleShopifyScriptTagScope}
                    isLoading={isInstallPending}
                >
                    Install
                </Button>
            )
        }

        return (
            <Button
                intent={ButtonIntent.Regular}
                variant={ButtonVariant.Secondary}
                isLoading={isUninstallPending}
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
                            <Icon
                                name={IconName.CircleCheck}
                                color="green"
                                size={IconSize.Lg}
                            />
                        </div>
                    ) : null}
                    <div>
                        {themeAppExtensionInstallation ? (
                            <Text
                                size={TextSize.Md}
                                variant={TextVariant.Medium}
                            >
                                Quick installation for Shopify
                            </Text>
                        ) : (
                            <Text
                                size={TextSize.Md}
                                variant={TextVariant.Medium}
                            >
                                1-click installation for Shopify
                            </Text>
                        )}
                        <br />
                        {renderCardSubtext()}
                    </div>
                </div>
                <div className={css.rightSection}>
                    {renderCardButton()}
                    {isShowOrHideOnSelectedUrlsEnabled && (
                        <Button
                            icon={
                                isOpen
                                    ? IconName.ArrowChevronUp
                                    : IconName.ArrowChevronDown
                            }
                            variant={ButtonVariant.Secondary}
                            intent={ButtonIntent.Regular}
                            onClick={() => setIsOpen(!isOpen)}
                        ></Button>
                    )}
                </div>
            </div>
            {isShowOrHideOnSelectedUrlsEnabled && hasIntegrationLoaded && (
                <VisibilityControls
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
            {isInstallOnShopifyCallbackEnabled && shopifyScriptTagScopeModal}
        </div>
    )
}

export default OneClickInstall

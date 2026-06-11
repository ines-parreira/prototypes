import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Map } from 'immutable'
import { fromJS } from 'immutable'
import { useAsyncFn } from '@gorgias/toolkit-react'

import {
    Button,
    ButtonIntent,
    ButtonVariant,
    Icon,
    Text,
    toast,
} from '@gorgias/axiom'

import { useAppDispatch } from 'hooks/useAppDispatch'
import { useAppSelector } from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import { StoreNameDropdown } from 'pages/integrations/integration/components/gorgias_chat/legacy/GorgiasChatIntegrationAppearance/StoreNameDropdown'
import { DisconnectStoreModal } from 'pages/integrations/integration/components/gorgias_chat/revamp/EditWizard/Installation/components/InstallationCard/DisconnectStoreModal'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getStoreIconNameFromType } from 'state/integrations/helpers'
import { getIntegrationsByType } from 'state/integrations/selectors'
import { errorToPlainText } from 'utils'

import css from './StoreController.less'

type Props = {
    integration: Map<any, any>
    storeIntegration: StoreIntegration | undefined
    storeIntegrations: StoreIntegration[]
    isOneClickInstallation: boolean
}

const StoreController = ({
    integration,
    storeIntegration,
    storeIntegrations,
    isOneClickInstallation,
}: Props) => {
    const dispatch = useAppDispatch()

    const [isChangingStore, setIsChangingStore] = useState(false)

    const getGorgiasChatIntegrations = useMemo(
        () => getIntegrationsByType(IntegrationType.GorgiasChat),
        [],
    )
    const gorgiasChatIntegrations = useAppSelector(getGorgiasChatIntegrations)
    const [localStoreIntegrationId, setLocalStoreIntegrationId] = useState(
        storeIntegration?.id ?? null,
    )
    const [isDisconnectModalOpen, setIsDisconnectModalOpen] = useState(false)

    const isDirty = useMemo(() => {
        return localStoreIntegrationId !== storeIntegration?.id
    }, [localStoreIntegrationId, storeIntegration?.id])

    useEffect(() => {
        setLocalStoreIntegrationId(storeIntegration?.id ?? null)
    }, [storeIntegration, isChangingStore])

    const [{ loading: isConnectPending }, handleConnect] = useAsyncFn(
        async (storeIntegration: StoreIntegration) => {
            const meta: Map<any, any> = integration.get('meta')

            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: meta
                    .set(
                        'shop_name',
                        getShopNameFromStoreIntegration(storeIntegration),
                    )
                    .set('shop_type', storeIntegration.type)
                    .set('shop_integration_id', storeIntegration.id)
                    .set('shopify_integration_ids', []),
            }

            try {
                await dispatch(
                    updateOrCreateIntegration(
                        fromJS(form),
                        undefined,
                        undefined,
                        undefined,
                        true,
                        undefined,
                        true,
                    ),
                )

                toast.success('Integration successfully updated')
                setIsChangingStore(false)
            } catch (error) {
                toast.error(
                    errorToPlainText(error) ?? 'Failed to update integration',
                )
            }
        },
        [integration],
    )

    const onConnectStore = useCallback(() => {
        const storeIntegration = storeIntegrations.find(
            (storeIntegration) =>
                storeIntegration.id === localStoreIntegrationId,
        )

        if (storeIntegration) {
            handleConnect(storeIntegration)
        }
    }, [localStoreIntegrationId, handleConnect, storeIntegrations])

    const [{ loading: isDisconnectPending }, handleDisconnect] =
        useAsyncFn(async () => {
            const meta: Map<any, any> = integration.get('meta')

            const form = {
                id: integration.get('id'),
                type: integration.get('type'),
                meta: meta
                    .set('shop_name', null)
                    .set('shop_type', null)
                    .set('shop_integration_id', null)
                    .set('shopify_integration_ids', []),
            }

            try {
                await dispatch(
                    updateOrCreateIntegration(
                        fromJS(form),
                        undefined,
                        undefined,
                        undefined,
                        true,
                        undefined,
                        true,
                    ),
                )

                toast.success('Integration successfully updated')
                setIsDisconnectModalOpen(false)
            } catch (error) {
                toast.error(
                    errorToPlainText(error) ?? 'Failed to update integration',
                )
            }
        }, [integration])

    const handleDeleteModalOpenChange = useCallback(
        (isOpen: boolean) => {
            if (!isDisconnectPending) {
                setIsDisconnectModalOpen(isOpen)
            }
        },
        [isDisconnectPending],
    )

    const storeControllButtons = useMemo(() => {
        if (!storeIntegration || isChangingStore) {
            return (
                <>
                    {storeIntegration && (
                        <Button
                            intent={ButtonIntent.Regular}
                            variant={ButtonVariant.Secondary}
                            onClick={() => setIsChangingStore(false)}
                            isDisabled={isConnectPending}
                        >
                            Cancel
                        </Button>
                    )}
                    <Button
                        isDisabled={!localStoreIntegrationId || !isDirty}
                        isLoading={isConnectPending}
                        onClick={onConnectStore}
                    >
                        Connect store
                    </Button>
                </>
            )
        }

        return (
            <>
                <Button
                    variant={ButtonVariant.Primary}
                    intent={ButtonIntent.Regular}
                    onClick={() => setIsChangingStore(true)}
                >
                    Change
                </Button>
                <Button
                    intent={ButtonIntent.Destructive}
                    variant={ButtonVariant.Tertiary}
                    onClick={() => setIsDisconnectModalOpen(true)}
                >
                    Disconnect
                </Button>
            </>
        )
    }, [
        storeIntegration,
        isChangingStore,
        localStoreIntegrationId,
        isDirty,
        isConnectPending,
        onConnectStore,
    ])

    return (
        <div className={css.storeController}>
            <div className={css.storeNameDropdown}>
                {storeIntegration && !isChangingStore ? (
                    <div className={css.storeLink}>
                        <Icon
                            name={getStoreIconNameFromType(
                                storeIntegration.type,
                            )}
                        />
                        {storeIntegration.type === IntegrationType.Shopify ? (
                            <a
                                href={`https://${storeIntegration.name}.myshopify.com`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {storeIntegration.name}
                            </a>
                        ) : (
                            <Text>{storeIntegration.name}</Text>
                        )}
                    </div>
                ) : (
                    <StoreNameDropdown
                        gorgiasChatIntegrations={fromJS(
                            gorgiasChatIntegrations,
                        )}
                        storeIntegrations={fromJS(storeIntegrations)}
                        storeIntegrationId={localStoreIntegrationId}
                        onChange={setLocalStoreIntegrationId}
                        isDisabled={isConnectPending}
                    />
                )}
            </div>
            <div className={css.buttons}>{storeControllButtons}</div>
            <DisconnectStoreModal
                isOpen={isDisconnectModalOpen}
                onOpenChange={handleDeleteModalOpenChange}
                onDisconnect={handleDisconnect}
                isDisconnectPending={isDisconnectPending}
                isOneClickInstallation={isOneClickInstallation}
            />
        </div>
    )
}

export { StoreController }

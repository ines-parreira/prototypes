import React, { useEffect, useMemo, useState } from 'react'

import { useAsyncFn } from '@repo/hooks'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { LegacyButton as Button } from '@gorgias/axiom'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import type { StoreIntegration } from 'models/integration/types'
import { IntegrationType } from 'models/integration/types'
import { getShopNameFromStoreIntegration } from 'models/selfServiceConfiguration/utils'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { updateOrCreateIntegration } from 'state/integrations/actions'
import { getIconFromType } from 'state/integrations/helpers'
import { getIntegrationsByType } from 'state/integrations/selectors'

import { StoreNameDropdown } from '../GorgiasChatIntegrationAppearance/StoreNameDropdown'

import css from './GorgiasChatIntegrationConnectStore.less'

type Props = {
    integration: Map<any, any>
    storeIntegration: StoreIntegration | undefined
    storeIntegrations: StoreIntegration[]
    isOneClickInstallation: boolean
    allowDisconnect?: boolean
    changeButtonLabel?: string
}

const GorgiasChatIntegrationConnectStore = ({
    integration,
    storeIntegration,
    storeIntegrations,
    isOneClickInstallation,
    allowDisconnect = true,
    changeButtonLabel = 'Change',
}: Props) => {
    const dispatch = useAppDispatch()

    const getGorgiasChatIntegrations = useMemo(
        () => getIntegrationsByType(IntegrationType.GorgiasChat),
        [],
    )
    const gorgiasChatIntegrations = useAppSelector(getGorgiasChatIntegrations)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [storeIntegrationId, setStoreIntegration] = useState(
        storeIntegration?.id ?? null,
    )

    useEffect(() => {
        setStoreIntegration(storeIntegration?.id ?? null)
    }, [storeIntegration])

    const handleModalOpen = () => {
        setIsModalOpen(true)
    }
    const handleModalClose = () => {
        setIsModalOpen(false)
    }

    const [{ loading: isConnectPending }, handleConnect] =
        useAsyncFn(async () => {
            if (!storeIntegrationId) {
                return
            }

            const storeIntegration = storeIntegrations.find(
                (storeIntegration) =>
                    storeIntegration.id === storeIntegrationId,
            )

            if (!storeIntegration) {
                return
            }

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

            await dispatch(updateOrCreateIntegration(fromJS(form)))

            setIsModalOpen(false)
        }, [integration, storeIntegrationId, storeIntegrations])
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

            await dispatch(updateOrCreateIntegration(fromJS(form)))
        }, [integration])

    const isDirty = storeIntegrationId !== storeIntegration?.id

    return (
        <>
            {storeIntegration ? (
                <div className={css.store}>
                    <img
                        className={css.storeIcon}
                        alt="logo"
                        src={getIconFromType(storeIntegration.type)}
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
                        <>{storeIntegration.name}</>
                    )}
                    <div className="ml-auto">
                        <Button
                            fillStyle="ghost"
                            intent="secondary"
                            onClick={handleModalOpen}
                        >
                            {changeButtonLabel}
                        </Button>
                        {allowDisconnect && (
                            <ConfirmButton
                                confirmationButtonIntent="destructive"
                                confirmationContent={
                                    isOneClickInstallation
                                        ? 'Disconnecting this store will remove AI Agent features and uninstall the chat from your store, removing it from all pages.'
                                        : 'Disconnecting this store will remove AI Agent features from your chat widget.'
                                }
                                confirmationTitle={<b>Disconnect store?</b>}
                                confirmLabel="Disconnect"
                                fillStyle="ghost"
                                intent="destructive"
                                onConfirm={handleDisconnect}
                                placement="top"
                                showCancelButton
                                isDisabled={isDisconnectPending}
                            >
                                Disconnect
                            </ConfirmButton>
                        )}
                    </div>
                </div>
            ) : (
                <Button intent="secondary" onClick={handleModalOpen}>
                    Connect
                </Button>
            )}
            <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                <ModalHeader
                    title={storeIntegration ? 'Change store' : 'Connect store'}
                />
                <ModalBody className={css.modalBody}>
                    <div>
                        {storeIntegration
                            ? 'A store connection is required to use AI Agent features and enable auto-embedding for Shopify stores.'
                            : 'Connect a store to use AI Agent features in chat and to enable 1-click install for Shopify.'}
                    </div>
                    <StoreNameDropdown
                        gorgiasChatIntegrations={fromJS(
                            gorgiasChatIntegrations,
                        )}
                        storeIntegrations={fromJS(storeIntegrations)}
                        storeIntegrationId={storeIntegrationId}
                        onChange={setStoreIntegration}
                    />
                </ModalBody>
                <ModalActionsFooter>
                    <Button intent="secondary" onClick={handleModalClose}>
                        Cancel
                    </Button>
                    <Button
                        isDisabled={!storeIntegrationId || !isDirty}
                        isLoading={isConnectPending}
                        onClick={handleConnect}
                    >
                        {storeIntegration ? 'Change store' : 'Connect store'}
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </>
    )
}

export default GorgiasChatIntegrationConnectStore

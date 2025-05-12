import React, { useCallback, useState } from 'react'

import { fromJS, Map } from 'immutable'
import { useFlags } from 'launchdarkly-react-client-sdk'

import useAppSelector from 'hooks/useAppSelector'
import { IntegrationType } from 'models/integration/types'
import Button from 'pages/common/components/button/Button'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import Modal from 'pages/common/components/modal/Modal'
import ModalActionsFooter from 'pages/common/components/modal/ModalActionsFooter'
import ModalBody from 'pages/common/components/modal/ModalBody'
import ModalHeader from 'pages/common/components/modal/ModalHeader'
import { getIconFromType } from 'state/integrations/helpers'
import { getStoreIntegrations } from 'state/integrations/selectors'

import { FeatureFlagKey } from '../../../../../../config/featureFlags'
import {
    useCreateStoreMapping,
    useDeleteStoreMapping,
    useListStoreMappings,
    useUpdateStoreMapping,
} from '../../../../../../models/storeMapping/queries'
import { StoreMapping } from '../../../../../../models/storeMapping/types'
import { StoreNameDropdown } from './StoreNameDropdown'

import css from './EmailIntegrationConnectStore.less'

type Props = {
    integration: Map<any, any>
}

const EmailIntegrationConnectStore = ({ integration }: Props) => {
    const storeIntegrations = useAppSelector(getStoreIntegrations)
    const showStoreMapping: boolean | undefined =
        useFlags()[FeatureFlagKey.EnableEmailToStoreMapping]
    const [storeIntegrationId, setStoreIntegration] = useState<number | null>(
        null,
    )
    const {
        data: storeMapping,
        isFetching,
        refetch,
        remove,
    } = useListStoreMappings<StoreMapping | undefined>(
        [integration.get('id')],
        {
            enabled: !!integration.get('id') && showStoreMapping,
            select: (data) => data[0],
            refetchOnWindowFocus: false,
            onSuccess(data) {
                setStoreIntegration(data?.store_id ?? null)
            },
        },
    )
    const [isModalOpen, setIsModalOpen] = useState(false)

    const handleModalOpen = () => {
        setIsModalOpen(true)
    }
    const handleModalClose = () => {
        setIsModalOpen(false)
    }

    const handleSettled = useCallback(() => {
        handleModalClose()
        return refetch()
    }, [refetch])

    const { mutate: createStoreMapping, isLoading: isCreating } =
        useCreateStoreMapping()
    const { mutate: updateStoreMapping, isLoading: isUpdating } =
        useUpdateStoreMapping()
    const { mutate: deleteStoreMapping, isLoading: isDeleting } =
        useDeleteStoreMapping()

    const handleCreateOrUpdate = useCallback(() => {
        const payload = {
            store_id: storeIntegrationId!,
            integration_id: integration.get('id'),
        }
        if (storeMapping) {
            updateStoreMapping([payload, integration.get('id')], {
                onSettled: handleSettled,
            })
        } else {
            createStoreMapping([payload], { onSuccess: handleSettled })
        }
    }, [
        storeMapping,
        updateStoreMapping,
        createStoreMapping,
        storeIntegrationId,
        integration,
        handleSettled,
    ])

    const isDirty = storeIntegrationId !== storeMapping?.store_id
    const storeIntegration = storeMapping?.store_id
        ? storeIntegrations.find(
              (integration) => integration.id === storeMapping?.store_id,
          )
        : undefined

    const isLoading = isFetching || isCreating || isUpdating || isDeleting

    if (!showStoreMapping) return null
    return (
        <div className={css.container}>
            <h3 className={css.header}>Connect Store</h3>
            <div className={css.description}>
                A store connection is required to use AI Agent features with
                this email address.
            </div>
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
                            isDisabled={isDeleting}
                        >
                            Change
                        </Button>
                        <ConfirmButton
                            confirmationButtonIntent="destructive"
                            confirmationContent={
                                'Disconnecting this store will remove all automation features currently enabled for the email address.'
                            }
                            confirmationTitle={<b>Disconnect store?</b>}
                            confirmLabel="Disconnect"
                            fillStyle="ghost"
                            intent="destructive"
                            isLoading={isDeleting}
                            onConfirm={() =>
                                deleteStoreMapping([integration.get('id')], {
                                    onSettled: () => {
                                        remove()
                                        return refetch()
                                    },
                                })
                            }
                            placement="top"
                            showCancelButton
                            isDisabled={isDeleting}
                        >
                            Disconnect
                        </ConfirmButton>
                    </div>
                </div>
            ) : (
                <Button
                    intent="secondary"
                    onClick={handleModalOpen}
                    isDisabled={isLoading}
                    isLoading={isLoading}
                >
                    Connect
                </Button>
            )}
            <Modal isOpen={isModalOpen} onClose={handleModalClose}>
                <ModalHeader
                    title={storeIntegration ? 'Change store' : 'Connect store'}
                />
                <ModalBody className={css.modalBody}>
                    <div>
                        Connect a store to use AI Agent features with this email
                        address.
                    </div>
                    <StoreNameDropdown
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
                        isLoading={isCreating || isUpdating}
                        onClick={handleCreateOrUpdate}
                    >
                        {storeIntegration ? 'Change store' : 'Connect store'}
                    </Button>
                </ModalActionsFooter>
            </Modal>
        </div>
    )
}

export default EmailIntegrationConnectStore

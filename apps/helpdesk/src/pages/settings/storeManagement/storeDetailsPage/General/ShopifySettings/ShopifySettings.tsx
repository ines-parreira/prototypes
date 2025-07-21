import React, { useCallback, useRef } from 'react'

import { ShopifyIntegration } from 'models/integration/types'
import UnsavedChangesPrompt from 'pages/common/components/UnsavedChangesPrompt'
import useQueryNotify from 'pages/integrations/integration/hooks/useQueryNotify'

import { useConfirmationModal } from '../hooks/useConfirmationModal'
import { useShopifySettingsForm } from '../hooks/useShopifySettingsForm'
import ConfirmCustomerMatchingModal from './ConfirmCustomerMatchingModal'
import { ShopifyActionButtons } from './ShopifyActionButtons'
import { StoreInformationForm } from './StoreInformationForm'

import css from './ShopifySettings.less'

export type ShopifySettingsProps = {
    integration: ShopifyIntegration
    onDeleteIntegration: (integration: ShopifyIntegration) => void
    redirectUri: string
    refetchStore: () => void
}

export default function ShopifySettings({
    integration,
    onDeleteIntegration,
    redirectUri,
    refetchStore,
}: ShopifySettingsProps) {
    useQueryNotify()

    const promptRef = useRef<{ onLeaveContext: () => void }>(null)

    const shopName = integration?.meta?.shop_name
    const isActive = !integration?.deactivated_datetime
    const isCustomersImportOver =
        integration.meta.import_state?.customers.is_over ?? false
    const needScopeUpdate = integration?.meta?.need_scope_update ?? false

    const {
        syncCustomerNotes,
        setSyncCustomerNotes,
        defaultAddressPhoneMatchingEnabled,
        setDefaultAddressPhoneMatchingEnabled,
        isSubmitting,
        handleUpdate,
        handleCancel,
        areIntegrationOptionsDirty,
        saveIntegrationMeta,
    } = useShopifySettingsForm({
        integration,
        onShowConfirmation: () => setIsConfirmationModalShown(true),
        refetchStore,
    })

    const {
        isConfirmationModalShown,
        setIsConfirmationModalShown,
        onConfirmationModalSave,
        onConfirmationModalDiscard,
    } = useConfirmationModal({
        onSave: saveIntegrationMeta,
        onReset: handleCancel,
    })

    const handleDelete = useCallback(() => {
        onDeleteIntegration(integration)
    }, [onDeleteIntegration, integration])

    const retriggerOAuthFlow = useCallback(() => {
        window.location.href = redirectUri.replace('{shop_name}', shopName)
    }, [shopName, redirectUri])

    return (
        <>
            <form onSubmit={handleUpdate}>
                <div className={css.container}>
                    <StoreInformationForm
                        isActive={isActive}
                        storeId={integration.id}
                        shopName={shopName}
                        isCustomersImportOver={isCustomersImportOver}
                        syncCustomerNotes={syncCustomerNotes}
                        defaultAddressPhoneMatchingEnabled={
                            defaultAddressPhoneMatchingEnabled
                        }
                        onSyncCustomerNotesChange={setSyncCustomerNotes}
                        onDefaultAddressPhoneMatchingChange={
                            setDefaultAddressPhoneMatchingEnabled
                        }
                    />
                    <ShopifyActionButtons
                        needScopeUpdate={needScopeUpdate}
                        isActive={isActive}
                        isSubmitting={isSubmitting}
                        areIntegrationOptionsDirty={areIntegrationOptionsDirty}
                        onRetriggerOAuthFlow={retriggerOAuthFlow}
                        onCancel={handleCancel}
                        onDelete={handleDelete}
                    />
                </div>
            </form>
            <ConfirmCustomerMatchingModal
                isOpen={isConfirmationModalShown}
                setIsOpen={setIsConfirmationModalShown}
                onConfirm={onConfirmationModalSave}
                onCancel={onConfirmationModalDiscard}
                isLoading={isSubmitting}
            />
            <UnsavedChangesPrompt
                ref={promptRef}
                shouldShowSaveButton
                shouldShowDiscardButton
                onSave={saveIntegrationMeta}
                when={areIntegrationOptionsDirty}
            />
        </>
    )
}

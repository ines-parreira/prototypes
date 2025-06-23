import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import css from './ShopifySettings.less'

interface ShopifyActionButtonsProps {
    needScopeUpdate: boolean
    isActive: boolean
    isSubmitting: boolean
    areIntegrationOptionsDirty: boolean
    onRetriggerOAuthFlow: () => void
    onCancel: () => void
    onDelete: () => void
}

export function ShopifyActionButtons({
    needScopeUpdate,
    isActive,
    isSubmitting,
    areIntegrationOptionsDirty,
    onRetriggerOAuthFlow,
    onCancel,
    onDelete,
}: ShopifyActionButtonsProps) {
    return (
        <div className={css.buttonGroup}>
            {needScopeUpdate && (
                <Button
                    fillStyle="fill"
                    intent="secondary"
                    isLoading={isSubmitting}
                    onClick={onRetriggerOAuthFlow}
                >
                    Update Permissions
                </Button>
            )}
            {!isActive && (
                <Button isLoading={isSubmitting} onClick={onRetriggerOAuthFlow}>
                    Reconnect
                </Button>
            )}
            {isActive && (
                <>
                    <Button
                        type="submit"
                        fillStyle="fill"
                        intent="primary"
                        isDisabled={isSubmitting || !areIntegrationOptionsDirty}
                    >
                        Save Changes
                    </Button>

                    <Button
                        fillStyle="fill"
                        intent="secondary"
                        onClick={onCancel}
                        isDisabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </>
            )}
            <Button
                fillStyle="ghost"
                intent="destructive"
                onClick={onDelete}
                isDisabled={isSubmitting}
                leadingIcon="delete_outline"
            >
                Delete Store
            </Button>
        </div>
    )
}

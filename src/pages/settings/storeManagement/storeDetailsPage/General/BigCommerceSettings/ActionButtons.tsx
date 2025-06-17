import React from 'react'

import { Button } from '@gorgias/merchant-ui-kit'

import css from './BigCommerceSettings.less'

interface ActionButtonsProps {
    needScopeUpdate: boolean
    isActive: boolean
    onRetriggerOAuthFlow: () => void
    onDelete: () => void
}

export function ActionButtons({
    needScopeUpdate,
    isActive,
    onRetriggerOAuthFlow,
    onDelete,
}: ActionButtonsProps) {
    return (
        <div className={css.buttonGroup}>
            {needScopeUpdate && (
                <Button
                    fillStyle="fill"
                    intent="secondary"
                    onClick={onRetriggerOAuthFlow}
                >
                    Update Permissions
                </Button>
            )}

            {!isActive && (
                <Button onClick={onRetriggerOAuthFlow}>Reconnect</Button>
            )}
            <Button
                fillStyle="ghost"
                intent="destructive"
                onClick={onDelete}
                leadingIcon="delete_outline"
            >
                Delete Store
            </Button>
        </div>
    )
}

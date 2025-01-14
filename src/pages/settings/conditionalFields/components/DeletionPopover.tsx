import {CustomFieldCondition} from '@gorgias/api-queries'
import React, {ComponentProps} from 'react'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import history from 'pages/history'
import {CUSTOM_FIELD_CONDITIONS_ROUTE} from 'routes/constants'

import useDeleteCustomFieldCondition from '../hooks/useDeleteCustomFieldCondition'

type Props = {
    children: ComponentProps<typeof ConfirmationPopover>['children']
    condition: CustomFieldCondition
    redirect?: boolean
}

export function DeletionPopover({
    children,
    condition,
    redirect = false,
}: Props) {
    const {mutateAsync: deleteCondition, isLoading: isDeleting} =
        useDeleteCustomFieldCondition()

    return (
        <ConfirmationPopover
            buttonProps={{
                intent: 'destructive',
                isLoading: isDeleting,
            }}
            id={`delete-condition-${condition.id}`}
            isOpen={isDeleting || undefined}
            content={
                <>
                    You are about to delete <b>{condition.name}</b>. This action
                    will not be reversible.
                </>
            }
            onConfirm={async () => {
                await deleteCondition({id: condition.id})
                if (redirect) {
                    history.push(
                        `/app/settings/${CUSTOM_FIELD_CONDITIONS_ROUTE}`
                    )
                }
            }}
        >
            {(props) => children(props)}
        </ConfirmationPopover>
    )
}

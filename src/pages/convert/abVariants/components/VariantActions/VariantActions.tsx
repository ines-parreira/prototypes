import React, {useCallback, useMemo} from 'react'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    variant: CampaignVariant | null
    variantName: string
    isDeletingDisabled: boolean
    isDuplicatingDisabled: boolean
    onDelete?: (variantId: string) => void
    onDuplicate: (variantId: string | null) => void
}

const VariantActions: React.FC<Props> = (props) => {
    const {
        variant,
        variantName,
        isDeletingDisabled,
        isDuplicatingDisabled,
        onDelete,
        onDuplicate,
    } = props

    const renderConfirmation = useCallback(
        ({uid, onDisplayConfirmation}) => {
            return (
                <IconButton
                    className="mr-1"
                    onClick={onDisplayConfirmation}
                    isDisabled={isDeletingDisabled}
                    fillStyle="ghost"
                    intent="destructive"
                    title="Delete campaign"
                    id={uid}
                    data-testid="delete-icon-button"
                >
                    delete
                </IconButton>
            )
        },
        [isDeletingDisabled]
    )

    const deleteButton = useMemo(() => {
        return (
            <ConfirmationPopover
                buttonProps={{
                    intent: 'destructive',
                }}
                content={
                    <>
                        You are about to delete <b>{variantName}</b>.
                    </>
                }
                id={`delete-variant-${variant?.id}`}
                onConfirm={() => variant && onDelete?.(variant.id)}
            >
                {renderConfirmation}
            </ConfirmationPopover>
        )
    }, [variant, variantName, onDelete, renderConfirmation])

    return (
        <>
            <IconButton
                className="mr-1"
                data-testid="duplicate-icon-button"
                fillStyle="ghost"
                intent="secondary"
                title="Duplicate variant"
                isDisabled={isDuplicatingDisabled}
                onClick={() => onDuplicate(variant ? variant.id : null)}
            >
                file_copy
            </IconButton>
            {deleteButton}
        </>
    )
}

export default VariantActions

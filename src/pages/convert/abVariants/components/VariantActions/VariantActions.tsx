import React, {useCallback, useMemo} from 'react'

import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'
import IconButton from 'pages/common/components/button/IconButton'

import {VariantTableEntry} from 'pages/convert/abVariants/types/VariantTableEntry'

type Props = {
    variantName: string
    data: VariantTableEntry
    isDeletingDisabled: boolean
    isDuplicatingDisabled: boolean
    onDelete?: (variantId: string) => void
    onDuplicate: (variantId: string | null) => void
}

const VariantActions: React.FC<Props> = (props) => {
    const {
        data,
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
                    aria-label="Delete campaign"
                    id={uid}
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
                id={`delete-variant-${data.variant?.id}`}
                onConfirm={() => data.variant && onDelete?.(data.variant.id)}
            >
                {renderConfirmation}
            </ConfirmationPopover>
        )
    }, [data, variantName, onDelete, renderConfirmation])

    return (
        <>
            <IconButton
                className="mr-1"
                fillStyle="ghost"
                intent="secondary"
                title="Duplicate variant"
                aria-label="Duplicate variant"
                isDisabled={isDuplicatingDisabled}
                onClick={() =>
                    onDuplicate(data.variant ? data.variant.id : null)
                }
            >
                file_copy
            </IconButton>
            {deleteButton}
        </>
    )
}

export default VariantActions

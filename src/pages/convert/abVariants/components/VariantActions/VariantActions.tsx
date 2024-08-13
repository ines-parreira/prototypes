import React from 'react'

import {CampaignVariant} from 'pages/convert/campaigns/types/CampaignVariant'

import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    variant: CampaignVariant | null
    isDeletingDisabled: boolean
    isDuplicatingDisabled: boolean
    onDelete?: (variantId: string) => void
    onDuplicate: (variantId: string | null) => void
}

const VariantActions: React.FC<Props> = (props) => {
    const {
        variant,
        isDeletingDisabled,
        isDuplicatingDisabled,
        onDelete,
        onDuplicate,
    } = props

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
            <IconButton
                className="mr-1"
                fillStyle="ghost"
                intent="destructive"
                title="Delete variant"
                data-testid="delete-icon-button"
                isDisabled={isDeletingDisabled}
                onClick={() => variant && onDelete?.(variant.id as string)}
            >
                delete
            </IconButton>
        </>
    )
}

export default VariantActions

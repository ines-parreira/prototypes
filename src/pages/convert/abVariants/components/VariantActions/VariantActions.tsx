import React from 'react'
import IconButton from 'pages/common/components/button/IconButton'

type Props = {
    isDeletingDisabled: boolean
    isDuplicatingDisabled: boolean
    onClickDelete?: () => void
    onClickDuplicate: () => void
}

const VariantActions: React.FC<Props> = (props) => {
    const {
        isDeletingDisabled,
        isDuplicatingDisabled,
        onClickDelete,
        onClickDuplicate,
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
                onClick={onClickDuplicate}
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
                onClick={onClickDelete}
            >
                delete
            </IconButton>
        </>
    )
}

export default VariantActions

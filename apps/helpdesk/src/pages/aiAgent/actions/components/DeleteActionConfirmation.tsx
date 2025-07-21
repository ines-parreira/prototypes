import IconButton from 'pages/common/components/button/IconButton'
import ConfirmationPopover from 'pages/common/components/popover/ConfirmationPopover'

type Props = {
    onDelete: () => void
    isDisabled: boolean
}

export default function DeleteActionConfirmation({
    onDelete,
    isDisabled,
}: Props) {
    return (
        <ConfirmationPopover
            buttonProps={{ intent: 'destructive' }}
            cancelButtonProps={{ intent: 'secondary' }}
            content="Are you sure you want to delete this Action?"
            title={<b>Delete Action?</b>}
            onConfirm={onDelete}
            confirmLabel="Delete"
            showCancelButton
        >
            {({ uid, onDisplayConfirmation }) => (
                <IconButton
                    onClick={onDisplayConfirmation}
                    fillStyle="ghost"
                    intent="destructive"
                    title="Delete"
                    id={uid}
                    isDisabled={isDisabled}
                >
                    delete
                </IconButton>
            )}
        </ConfirmationPopover>
    )
}

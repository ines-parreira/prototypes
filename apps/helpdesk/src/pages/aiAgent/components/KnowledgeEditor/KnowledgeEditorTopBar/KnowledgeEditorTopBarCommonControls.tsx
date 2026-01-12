import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

export const EditIconButton = (props: {
    onEdit?: () => void
    disabled?: boolean
    disabledReason?: string
}) => {
    const isDisabled = props.disabled || !props.onEdit

    const button = (
        <Button
            onClick={props.onEdit}
            aria-label="edit"
            isDisabled={isDisabled}
            variant="secondary"
            icon="edit-pencil"
        />
    )

    if (props.disabledReason && !props.onEdit) {
        return (
            <Tooltip placement="bottom">
                <TooltipTrigger>{button}</TooltipTrigger>
                <TooltipContent title={props.disabledReason} />
            </Tooltip>
        )
    }

    return button
}

export const DeleteIconButton = (props: {
    onDelete: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onDelete}
        aria-label="delete"
        isDisabled={props.disabled}
        variant="secondary"
        icon="trash-empty"
    />
)

export const CancelButton = (props: {
    onCancel: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onCancel}
        isDisabled={props.disabled}
        variant="secondary"
    >
        Cancel
    </Button>
)

export const DeleteDraftButton = (props: {
    onDelete: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onDelete}
        isDisabled={props.disabled}
        variant="tertiary"
        intent="destructive"
    >
        Delete
    </Button>
)

export const CopyIconButton = (props: {
    onCopy: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onCopy}
        isDisabled={props.disabled}
        variant="secondary"
        icon="copy"
    />
)

export const DeleteButton = (props: {
    onDelete?: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onDelete}
        aria-label="delete"
        isDisabled={props.disabled || !props.onDelete}
        variant="secondary"
        intent="destructive"
        icon="trash-empty"
    />
)

export const TestButton = (props: {
    onTest: () => void
    disabled?: boolean
}) => (
    <Button
        onClick={props.onTest}
        isDisabled={props.disabled}
        variant="secondary"
    >
        Test
    </Button>
)

import { Button, Tooltip, TooltipContent, TooltipTrigger } from '@gorgias/axiom'

export const withTooltip = (
    button: React.ReactElement<React.DOMAttributes<HTMLElement>, string>,
    title: string,
    isDisabled: boolean,
) => {
    if (isDisabled) {
        return button
    }

    return (
        <Tooltip placement="bottom">
            <TooltipTrigger>{button}</TooltipTrigger>
            <TooltipContent title={title} />
        </Tooltip>
    )
}

export const EditIconButton = (props: {
    onEdit?: () => void
    disabled?: boolean
    disabledReason?: string
}) => {
    const isDisabled = props.disabled || !props.onEdit
    const tooltipTitle =
        props.disabledReason && !props.onEdit ? props.disabledReason : 'Edit'

    return withTooltip(
        <Button
            onClick={props.onEdit}
            aria-label="edit"
            isDisabled={isDisabled}
            variant="secondary"
            icon="edit-pencil"
        />,
        tooltipTitle,
        isDisabled,
    )
}

export const DeleteIconButton = (props: {
    onDelete: () => void
    disabled?: boolean
}) =>
    withTooltip(
        <Button
            onClick={props.onDelete}
            aria-label="delete"
            isDisabled={props.disabled}
            variant="secondary"
            icon="trash-empty"
        />,
        'Delete',
        !!props.disabled,
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
}) =>
    withTooltip(
        <Button
            onClick={props.onCopy}
            isDisabled={props.disabled}
            variant="secondary"
            icon="copy"
        />,
        'Duplicate',
        !!props.disabled,
    )

export const DeleteButton = (props: {
    onDelete?: () => void
    disabled?: boolean
}) => {
    const isDisabled = props.disabled || !props.onDelete

    return withTooltip(
        <Button
            onClick={props.onDelete}
            aria-label="delete"
            isDisabled={isDisabled}
            variant="secondary"
            intent="destructive"
            icon="trash-empty"
        />,
        'Delete',
        isDisabled,
    )
}

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

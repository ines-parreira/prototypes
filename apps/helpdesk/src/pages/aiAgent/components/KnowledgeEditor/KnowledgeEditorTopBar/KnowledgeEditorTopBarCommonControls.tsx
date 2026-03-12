import { Button, Tooltip, TooltipContent } from '@gorgias/axiom'

export const withTooltip = (
    button: React.ReactElement<React.DOMAttributes<HTMLElement>, string>,
    title: string,
    isDisabled: boolean,
    shortcut?: string,
    caption?: string,
) => {
    // Show tooltip if disabled with caption
    if (isDisabled && caption) {
        return (
            <Tooltip placement="bottom" trigger={button}>
                <TooltipContent caption={caption} />
            </Tooltip>
        )
    }

    // Don't show tooltip when disabled and no caption
    if (isDisabled) {
        return button
    }

    return (
        <Tooltip placement="bottom" trigger={button}>
            <TooltipContent title={title} shortcut={shortcut} />
        </Tooltip>
    )
}

export const EditIconButton = (props: {
    onEdit?: () => void
    disabled?: boolean
    disabledReason?: string
}) => {
    const isDisabled = props.disabled || !props.onEdit

    return withTooltip(
        <Button
            onClick={props.onEdit}
            aria-label="edit"
            isDisabled={isDisabled}
            variant="secondary"
            icon="edit-pencil"
        />,
        'Edit',
        isDisabled,
        undefined,
        props.disabledReason,
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
}) =>
    withTooltip(
        <Button
            onClick={props.onDelete}
            aria-label="Delete"
            isDisabled={props.disabled}
            variant="secondary"
            intent="destructive"
            icon="trash-empty"
        />,
        'Delete',
        !!props.disabled,
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

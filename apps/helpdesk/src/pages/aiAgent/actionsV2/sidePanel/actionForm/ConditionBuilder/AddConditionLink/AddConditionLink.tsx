import { Button } from '@gorgias/axiom'

type Props = {
    onClick: () => void
    label?: string
}

export const AddConditionLink = ({
    onClick,
    label = 'Add condition',
}: Props) => (
    <Button
        as="button"
        variant="tertiary"
        size="sm"
        intent="regular"
        leadingSlot="add"
        onClick={onClick}
    >
        {label}
    </Button>
)

import { Button } from '@gorgias/axiom'

type ClearSearchButtonProps = {
    onClick: () => void
    isDisabled?: boolean
}

export const ClearSearchButton = ({ onClick }: ClearSearchButtonProps) => (
    <Button
        as="button"
        intent="regular"
        leadingSlot="close-circle"
        size="sm"
        variant="secondary"
        onClick={onClick}
    >
        Clear search
    </Button>
)

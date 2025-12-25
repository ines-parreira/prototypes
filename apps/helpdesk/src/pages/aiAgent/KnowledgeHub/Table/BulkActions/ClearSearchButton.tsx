import { Button } from '@gorgias/axiom'
import type { ButtonSize } from '@gorgias/axiom'

type ClearSearchButtonProps = {
    onClick: () => void
    size?: ButtonSize
}

export const ClearSearchButton = ({
    onClick,
    size,
}: ClearSearchButtonProps) => (
    <Button
        as="button"
        intent="regular"
        leadingSlot="close-circle"
        size={size || 'sm'}
        variant="secondary"
        onClick={onClick}
    >
        Clear search and filters
    </Button>
)

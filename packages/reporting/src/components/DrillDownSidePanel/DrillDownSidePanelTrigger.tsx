import { Button, Icon, Text } from '@gorgias/axiom'

type Props = {
    count: number
    onClick: () => void
    isDisabled?: boolean
}

export const DrillDownSidePanelTrigger = ({
    count,
    onClick,
    isDisabled = false,
}: Props) => {
    if (isDisabled) return null

    return (
        <Button
            variant="tertiary"
            size="sm"
            onClick={onClick}
            leadingSlot={
                <Icon
                    name="arrow-sub-down-right"
                    color="content-neutral-tertiary"
                />
            }
        >
            <Text size="sm" color="content-neutral-tertiary">
                {count} items
            </Text>
        </Button>
    )
}

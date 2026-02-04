import { ButtonGroup, ButtonGroupItem } from '@gorgias/axiom'

type Segment = {
    value: string
    label: string
}

type Props = {
    selectedValue: string
    onValueChange: (value: string) => void
    isDisabled?: boolean
    segments: Segment[]
}

export const PlaygroundSegmentControl = ({
    selectedValue,
    onValueChange,
    isDisabled,
    segments,
}: Props) => {
    return (
        <ButtonGroup
            selectedKey={selectedValue}
            onSelectionChange={onValueChange}
            isDisabled={isDisabled}
        >
            {segments.map((segment) => (
                <ButtonGroupItem key={segment.value} id={segment.value}>
                    {segment.label}
                </ButtonGroupItem>
            ))}
        </ButtonGroup>
    )
}

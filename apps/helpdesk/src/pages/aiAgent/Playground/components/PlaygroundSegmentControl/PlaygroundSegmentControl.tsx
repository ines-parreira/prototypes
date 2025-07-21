import Button from 'pages/common/components/button/Button'

import css from './PlaygroundSegmentControl.less'

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

const SegmentButton = ({
    onClick,
    label,
    isActive,
    isDisabled,
}: {
    isActive: boolean
    onClick: () => void
    label: string
    isDisabled?: boolean
}) => {
    return (
        <Button
            intent="secondary"
            size="small"
            role="tab"
            aria-selected={isActive ? 'true' : 'false'}
            fillStyle={isActive ? 'fill' : 'ghost'}
            onClick={onClick}
            isDisabled={isDisabled}
        >
            {label}
        </Button>
    )
}

export const PlaygroundSegmentControl = ({
    selectedValue,
    onValueChange,
    isDisabled,
    segments,
}: Props) => {
    return (
        <div className={css.container}>
            {segments.map((segment) => (
                <SegmentButton
                    key={segment.value}
                    isActive={selectedValue === segment.value}
                    label={segment.label}
                    onClick={() => onValueChange(segment.value)}
                    isDisabled={isDisabled}
                />
            ))}
        </div>
    )
}

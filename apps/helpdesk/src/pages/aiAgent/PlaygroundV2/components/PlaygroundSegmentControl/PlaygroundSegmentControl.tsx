import cn from 'classnames'

import { LegacyButton as Button } from '@gorgias/axiom'

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
            onClick={onClick}
            isDisabled={isDisabled}
            intent="secondary"
            className={cn([
                css.channelButton,
                isActive ? css.channelButtonActive : '',
            ])}
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

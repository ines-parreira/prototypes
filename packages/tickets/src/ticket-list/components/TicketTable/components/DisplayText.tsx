import type { ComponentProps } from 'react'

import { Text } from '@gorgias/axiom'

import type { DisplayTextValue } from '../../../types/display'
import { HighlightedText } from './HighlightedText'

type Props = {
    value: DisplayTextValue
    overflow?: 'ellipsis'
    size?: 'xs' | 'sm' | 'md'
    color?: ComponentProps<typeof Text>['color']
    variant?: 'bold' | 'regular' | 'medium'
}

export function DisplayText({ value, overflow, size, color, variant }: Props) {
    if (value.highlightedHtml) {
        return (
            <HighlightedText
                value={value.highlightedHtml}
                overflow={overflow}
                size={size}
                color={color}
                variant={variant}
            />
        )
    }

    return (
        <Text overflow={overflow} size={size} color={color} variant={variant}>
            {value.text}
        </Text>
    )
}

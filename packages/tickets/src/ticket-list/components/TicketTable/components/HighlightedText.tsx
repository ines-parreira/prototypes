import type { ComponentProps } from 'react'

import { sanitizeHtmlDefault } from '@repo/utils'

import { Text } from '@gorgias/axiom'

import css from './HighlightedText.module.less'

type Props = {
    value: string
    overflow?: 'ellipsis'
    size?: 'xs' | 'sm' | 'md'
    color?: ComponentProps<typeof Text>['color']
    variant?: 'bold' | 'regular' | 'medium'
}

export function HighlightedText({
    value,
    overflow,
    size,
    color,
    variant,
}: Props) {
    return (
        <Text
            overflow={overflow}
            size={size}
            color={color}
            variant={variant}
            className={css.highlightedText}
        >
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(value),
                }}
            />
        </Text>
    )
}

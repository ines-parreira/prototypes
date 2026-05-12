import { Children, useState } from 'react'

import { useId } from '@repo/hooks'

import { Box, Button } from '@gorgias/axiom'

export type ShowMoreListProps = {
    children: React.ReactNode
    threshold?: number
}

const DEFAULT_THRESHOLD = 4

export const ShowMoreList = ({
    children,
    threshold = DEFAULT_THRESHOLD,
}: ShowMoreListProps) => {
    const [isExpanded, setIsExpanded] = useState(false)
    const containerId = useId()

    const childArray = Children.toArray(children)
    const visibleChildren = isExpanded
        ? childArray
        : childArray.slice(0, threshold)
    const hiddenCount = childArray.length - threshold
    const shouldShowButton = childArray.length > threshold

    return (
        <Box display="flex" flexDirection="column" gap="xs">
            <Box
                id={containerId}
                display="flex"
                flexWrap="wrap"
                gap="md"
                width="100%"
                as="div"
            >
                {visibleChildren}
            </Box>
            {shouldShowButton && (
                <Box display="flex" justifyContent="center" width="100%">
                    <Button
                        variant="tertiary"
                        size="md"
                        aria-expanded={isExpanded}
                        aria-controls={containerId}
                        onClick={() => setIsExpanded(!isExpanded)}
                        trailingSlot={
                            isExpanded ? 'expand_less' : 'expand_more'
                        }
                    >
                        {isExpanded ? 'Show less' : `Show ${hiddenCount} more`}
                    </Button>
                </Box>
            )}
        </Box>
    )
}

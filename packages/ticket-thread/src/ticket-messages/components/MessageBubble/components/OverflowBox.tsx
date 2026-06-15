import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Box, Button } from '@gorgias/axiom'

type OverflowBoxRenderProps = {
    isExpanded: boolean
    isOverflowing: boolean
}

type OverflowBoxProps = {
    children: ReactNode | ((props: OverflowBoxRenderProps) => ReactNode)
    className?: string
    nonExpandedMaxHeight: number
}

export function OverflowBox({
    children,
    className,
    nonExpandedMaxHeight,
}: OverflowBoxProps) {
    // Likely candidate for future Axiom migration if Axiom adds a container-style
    // overflow primitive - OverflowList is item-based and does not cover this case.
    const contentRef = useRef<HTMLDivElement>(null)
    const measureButtonContainerRef = useRef<HTMLDivElement>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isOverflowing, setIsOverflowing] = useState(false)
    const [collapsedContentMaxHeight, setCollapsedContentMaxHeight] =
        useState(nonExpandedMaxHeight)

    useLayoutEffect(() => {
        const contentElement = contentRef.current
        const measureButtonContainerElement = measureButtonContainerRef.current

        if (!contentElement || !measureButtonContainerElement) {
            return
        }

        const measureButtonHeight = measureButtonContainerElement.offsetHeight
        const nextCollapsedContentMaxHeight = Math.max(
            nonExpandedMaxHeight - measureButtonHeight,
            0,
        )

        setCollapsedContentMaxHeight(nextCollapsedContentMaxHeight)
        setIsOverflowing(
            contentElement.scrollHeight + measureButtonHeight >
                nonExpandedMaxHeight,
        )
    }, [nonExpandedMaxHeight])

    return (
        <Box
            className={className}
            flexDirection="column"
            alignItems="flex-start"
            width="100%"
            style={{ position: 'relative' }}
        >
            <div
                ref={contentRef}
                style={{
                    width: '100%',
                    overflowX: 'hidden',
                    overflowY:
                        !isExpanded && isOverflowing ? 'hidden' : 'visible',
                    maxHeight:
                        !isExpanded && isOverflowing
                            ? `${collapsedContentMaxHeight}px`
                            : undefined,
                }}
            >
                {typeof children === 'function'
                    ? children({ isExpanded, isOverflowing })
                    : children}
            </div>
            {isOverflowing ? (
                <Box pt="xxxs">
                    <Button
                        size="sm"
                        variant="tertiary"
                        onClick={() => {
                            setIsExpanded(
                                (currentIsExpanded) => !currentIsExpanded,
                            )
                        }}
                        trailingSlot={
                            isExpanded
                                ? 'arrow-chevron-up'
                                : 'arrow-chevron-down'
                        }
                    >
                        {isExpanded ? 'Show Less' : 'Show More'}
                    </Button>
                </Box>
            ) : null}
            <div
                aria-hidden
                style={{
                    position: 'absolute',
                    visibility: 'hidden',
                    pointerEvents: 'none',
                    inset: 0,
                }}
            >
                <Box pt="xxxs" ref={measureButtonContainerRef}>
                    <Button
                        size="sm"
                        variant="tertiary"
                        trailingSlot="arrow-chevron-down"
                    >
                        Show More
                    </Button>
                </Box>
            </div>
        </Box>
    )
}

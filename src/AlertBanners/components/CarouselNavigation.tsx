import React from 'react'

import { Box, IconButton } from '@gorgias/merchant-ui-kit'

type CarouselNavigationProps = {
    onPrevious: VoidFunction
    onNext: VoidFunction
    currentIndex: number
    total: number
}

export const CarouselNavigation = ({
    onPrevious,
    onNext,
    currentIndex,
    total,
}: CarouselNavigationProps) => {
    return (
        <Box>
            <IconButton
                icon="chevron_left"
                intent="secondary"
                fillStyle="ghost"
                onClick={total > 1 ? onPrevious : undefined}
                isDisabled={total <= 1}
            />
            <IconButton
                icon="chevron_right"
                intent="secondary"
                fillStyle="ghost"
                onClick={total > 1 ? onNext : undefined}
                isDisabled={total <= 1}
            />
            <Box ml="16px" mr="16px" alignItems="center" flexWrap="nowrap">
                <span
                    style={{
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        color: 'var(--neutral-grey-5)',
                        width: '29px',
                    }}
                >
                    {currentIndex} of {total}
                </span>
            </Box>
        </Box>
    )
}

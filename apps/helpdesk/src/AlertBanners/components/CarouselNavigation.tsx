import { Box, LegacyIconButton as IconButton, Separator } from '@gorgias/axiom'

import css from './AlertBanner.less'

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
    if (total <= 1) {
        return null
    }

    return (
        <Box alignItems="center">
            <IconButton
                icon="chevron_left"
                intent="secondary"
                fillStyle="ghost"
                onClick={total > 1 ? onPrevious : undefined}
                aria-label="previous banner"
            />
            <Box
                w="40px"
                alignItems="center"
                flexWrap="nowrap"
                justifyContent="center"
            >
                <span
                    style={{
                        whiteSpace: 'nowrap',
                        fontSize: '12px',
                        color: 'var(--content-neutral-default)',
                        width: '29px',
                    }}
                >
                    {currentIndex} of {total}
                </span>
            </Box>
            <IconButton
                icon="chevron_right"
                intent="secondary"
                fillStyle="ghost"
                onClick={total > 1 ? onNext : undefined}
                aria-label="next banner"
            />
            <Box ml="16px" mr="16px" h="30px" className={css.separator}>
                <Separator direction="vertical" />
            </Box>
        </Box>
    )
}

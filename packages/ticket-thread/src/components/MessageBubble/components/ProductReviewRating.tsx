import ReactStars from 'react-rating-stars-component'

import type { ColorValue } from '@gorgias/axiom'
import { Box, Icon, Text } from '@gorgias/axiom'

type ProductReviewRatingProps = {
    reviewCount?: number | null
    value?: number | null
}

const FILLED_STAR_COLOR = 'static-additional-yellow' as ColorValue
const EMPTY_STAR_COLOR = 'static-secondary' as ColorValue

export function ProductReviewRating({
    reviewCount,
    value,
}: ProductReviewRatingProps) {
    const ratingValue = typeof value === 'number' ? value : 0

    return (
        <Box alignItems="center" gap="xxxs">
            <ReactStars
                count={5}
                edit={false}
                isHalf
                size={16}
                value={ratingValue}
                emptyIcon={
                    <Icon name="star" size="sm" color={EMPTY_STAR_COLOR} />
                }
                halfIcon={
                    <Icon
                        name="star-half"
                        size="sm"
                        color={FILLED_STAR_COLOR}
                    />
                }
                filledIcon={
                    <Icon
                        name="star-full"
                        size="sm"
                        color={FILLED_STAR_COLOR}
                    />
                }
            />
            {reviewCount != null ? (
                <Text size="sm" color="content-neutral-secondary">
                    ({reviewCount})
                </Text>
            ) : null}
        </Box>
    )
}

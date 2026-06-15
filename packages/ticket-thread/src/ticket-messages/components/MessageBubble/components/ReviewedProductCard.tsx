import { proxifyURL } from '@repo/utils'
import cn from 'classnames'

import {
    Box,
    Card,
    Icon,
    IconName,
    Image,
    Link,
    Tag,
    TagColor,
    Text,
} from '@gorgias/axiom'

import { OverflowBox } from './OverflowBox'
import { ProductReviewRating } from './ProductReviewRating'
import { SectionHeader } from './SectionHeader'
import type { ReviewedProductData } from './utils/product'
import { getReviewedProductData } from './utils/product'

import css from './ReviewedProductCard.less'

type ReviewedProductCardProps = {
    product: unknown
}

function ProductTitle({
    name,
    url,
}: Pick<ReviewedProductData, 'name' | 'url'>) {
    if (!url) {
        return (
            <Text size="md" color="content-neutral-default">
                {name}
            </Text>
        )
    }

    return (
        <Link
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            size="md"
            trailingSlot="external-link"
        >
            {name}
        </Link>
    )
}

export function ReviewedProductCard({ product }: ReviewedProductCardProps) {
    const reviewedProduct = getReviewedProductData(product)

    if (!reviewedProduct) {
        return null
    }

    const {
        averageScore,
        categoryName,
        description,
        imageUrl,
        name,
        totalReviews,
        url,
    } = reviewedProduct

    return (
        <Box flexDirection="column" gap="xs">
            <SectionHeader icon={IconName.AppYotpo} label="Reviewed product" />
            <Card
                p="sm"
                className={css.card}
                flexDirection="row"
                gap="xs"
                width="100%"
                minWidth={0}
                alignItems="flex-start"
            >
                <Box className={css.productImageWrapper}>
                    {imageUrl ? (
                        <Image
                            src={proxifyURL(imageUrl, '120x120')}
                            alt={name}
                            fit="cover"
                            className={css.productImage}
                            fallback={
                                <Box
                                    alignItems="center"
                                    justifyContent="center"
                                    className={css.productImage}
                                >
                                    <Icon
                                        name="media-image"
                                        size="md"
                                        color="content-neutral-secondary"
                                    />
                                </Box>
                            }
                        />
                    ) : (
                        <Box
                            alignItems="center"
                            justifyContent="center"
                            className={css.productImage}
                        >
                            <Icon
                                name="media-image"
                                size="md"
                                color="content-neutral-secondary"
                            />
                        </Box>
                    )}
                </Box>
                <OverflowBox
                    className={css.productDetails}
                    nonExpandedMaxHeight={120}
                >
                    {({ isExpanded }) => (
                        <Box
                            flexDirection="column"
                            gap="xxxs"
                            alignItems="flex-start"
                            width="100%"
                            minWidth={0}
                        >
                            <ProductTitle name={name} url={url} />
                            <ProductReviewRating
                                value={averageScore}
                                reviewCount={totalReviews}
                            />
                            {description && (
                                <Text
                                    size="sm"
                                    color="content-neutral-secondary"
                                    className={cn(css.description, {
                                        [css.descriptionCollapsed]: !isExpanded,
                                    })}
                                >
                                    {description}
                                </Text>
                            )}
                            {categoryName && (
                                <Tag size="sm" color={TagColor.Grey}>
                                    {categoryName}
                                </Tag>
                            )}
                        </Box>
                    )}
                </OverflowBox>
            </Card>
        </Box>
    )
}

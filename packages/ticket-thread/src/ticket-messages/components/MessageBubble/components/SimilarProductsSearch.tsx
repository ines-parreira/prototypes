import { proxifyURL } from '@repo/utils'

import {
    Box,
    Icon,
    Image,
    Tag,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import css from './SimilarProductsSearch.less'

type ProductReferenceProps = {
    imageUrl: string | null
    title: string
    url: string
}

export function ProductReference({
    imageUrl,
    title,
    url,
}: ProductReferenceProps) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={css.productBubble}
            aria-label={title}
        >
            <Box gap="xxxs" alignItems="center">
                {imageUrl ? (
                    <Image
                        src={proxifyURL(imageUrl, '32x32')}
                        alt={title}
                        fit="cover"
                        className={css.image}
                        fallback={
                            <Box
                                alignItems="center"
                                justifyContent="center"
                                className={css.image}
                            >
                                <Icon
                                    name="media-image"
                                    size="sm"
                                    color="content-neutral-secondary"
                                />
                            </Box>
                        }
                    />
                ) : (
                    <Box
                        alignItems="center"
                        justifyContent="center"
                        className={css.image}
                    >
                        <Icon
                            name="media-image"
                            size="sm"
                            color="content-neutral-secondary"
                        />
                    </Box>
                )}
                <Text size="sm" color="content-neutral-secondary">
                    {title}
                </Text>
            </Box>
        </a>
    )
}

export function MoreLikeThisCaption() {
    return (
        <Box gap="xs" alignItems="center">
            <Icon
                name="arrow-sub-down-right"
                size="sm"
                color="content-neutral-secondary"
            />
            <Tooltip trigger={<Tag>More like this</Tag>}>
                <TooltipContent title="User selected more like this" />
            </Tooltip>
        </Box>
    )
}

export function SimilarProductsSearch({
    imageUrl,
    title,
    url,
}: ProductReferenceProps) {
    return (
        <Box flexDirection="column" gap="xs" alignSelf="flex-start">
            <ProductReference imageUrl={imageUrl} title={title} url={url} />
            <MoreLikeThisCaption />
        </Box>
    )
}

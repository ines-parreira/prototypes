import { formatCurrency, proxifyURL } from '@repo/utils'
import cn from 'classnames'

import { Box, Icon, Image, Text, TextVariant } from '@gorgias/axiom'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { getProductAttachmentData, isProductAttachment } from './utils/product'

import attachmentCss from './Attachment.less'
import css from './ProductAttachment.less'

export { isProductAttachment } from './utils/product'

type ProductAttachmentProps = {
    attachment: TicketMessageAttachment
}

export function ProductAttachment({ attachment }: ProductAttachmentProps) {
    const { variantName, currencyCode, price, compareAtPrice, link } =
        getProductAttachmentData(attachment)
    const formattedPrice = formatCurrency(
        price && currencyCode ? { amount: price, currencyCode } : null,
        { fallback: '' },
    )
    const formattedCompareAtPrice = formatCurrency(
        compareAtPrice && currencyCode
            ? { amount: compareAtPrice, currencyCode }
            : null,
        { fallback: '' },
    )

    return (
        <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className={css.card}
            aria-label={attachment.name ?? 'Product attachment'}
        >
            <Box flexDirection="column" gap="xs">
                <Box className={cn(attachmentCss.cardSurface, css.cardSurface)}>
                    <Image
                        src={proxifyURL(attachment.url, '120x120')}
                        alt={attachment.name ?? 'Product attachment'}
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
                                    size="md"
                                    color="content-neutral-secondary"
                                />
                            </Box>
                        }
                    />
                </Box>
                <Box flexDirection="column" gap="xxxs">
                    <Text
                        size="sm"
                        variant={TextVariant.Bold}
                        color="content-neutral-default"
                        className={css.name}
                    >
                        {attachment.name}
                    </Text>
                    {variantName && (
                        <Text
                            size="sm"
                            color="content-neutral-secondary"
                            overflow="ellipsis"
                        >
                            {variantName}
                        </Text>
                    )}
                    {(formattedPrice || formattedCompareAtPrice) && (
                        <Box
                            className={css.prices}
                            alignItems="flex-start"
                            gap="xxxs"
                        >
                            {formattedPrice && (
                                <Text size="sm" color="content-neutral-default">
                                    {formattedPrice}
                                </Text>
                            )}
                            {formattedCompareAtPrice && (
                                <Text
                                    size="sm"
                                    className={css.compareAtPrice}
                                    color="content-neutral-secondary"
                                >
                                    {formattedCompareAtPrice}
                                </Text>
                            )}
                        </Box>
                    )}
                </Box>
            </Box>
        </a>
    )
}

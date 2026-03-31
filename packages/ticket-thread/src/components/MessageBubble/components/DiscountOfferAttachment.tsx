import cn from 'classnames'

import { Box, Icon, IconName, Text, TextVariant } from '@gorgias/axiom'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { getDiscountOfferAttachmentData } from './utils/discountOffer'

import attachmentCss from './Attachment.less'
import css from './DiscountOfferAttachment.less'

type DiscountOfferAttachmentProps = {
    attachment: TicketMessageAttachment
}

export function DiscountOfferAttachment({
    attachment,
}: DiscountOfferAttachmentProps) {
    const { name, summary } = getDiscountOfferAttachmentData(attachment)

    return (
        <Box className={css.container} flexDirection="column" gap="xs">
            <Box
                className={cn(attachmentCss.cardSurface, css.card)}
                flexDirection="column"
                justifyContent="center"
                alignItems="flex-start"
                gap="xxxs"
            >
                <Icon
                    name={IconName.Tag}
                    size="sm"
                    color="content-neutral-secondary"
                />
                <Text
                    size="sm"
                    variant={TextVariant.Bold}
                    color="content-neutral-default"
                    className={css.name}
                >
                    {name}
                </Text>
                {summary && (
                    <Text size="sm" color="content-neutral-secondary">
                        {summary}
                    </Text>
                )}
            </Box>
            <Text size="sm" color="content-neutral-secondary">
                Discount code shared with customer
            </Text>
        </Box>
    )
}

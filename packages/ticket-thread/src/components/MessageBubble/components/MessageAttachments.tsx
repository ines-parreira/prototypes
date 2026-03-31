import { useState } from 'react'

import { replaceAttachmentURL, shortcutManager } from '@repo/utils'
import YetAnotherLightbox from 'yet-another-react-lightbox'
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails'

import 'yet-another-react-lightbox/styles.css'
import 'yet-another-react-lightbox/plugins/thumbnails.css'

import { Banner, Box, Icon, IconName, Text } from '@gorgias/axiom'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import type {
    TicketThreadAiAgentMessageItem,
    TicketThreadInternalNoteItem,
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { Attachment } from './Attachment'
import { DiscountOfferAttachment } from './DiscountOfferAttachment'
import { isProductAttachment, ProductAttachment } from './ProductAttachment'
import { isDiscountOfferAttachment } from './utils/discountOffer'
import { isImage } from './utils/image'

type MessageAttachmentsProps = {
    item:
        | TicketThreadRegularMessageItem
        | TicketThreadInternalNoteItem
        | TicketThreadAiAgentMessageItem
    attachmentsLabel?: string
}

function SectionHeader({ icon, label }: { icon: IconName; label: string }) {
    return (
        <Box alignItems="center" gap="xxxxs">
            <Icon name={icon} size="sm" color="content-neutral-secondary" />
            <Text size="sm" color="content-neutral-secondary">
                {label}
            </Text>
        </Box>
    )
}

function partitionAttachments(attachments: TicketMessageAttachment[]) {
    const failed: TicketMessageAttachment[] = []
    const linked: TicketMessageAttachment[] = []
    const regular: TicketMessageAttachment[] = []
    const images: TicketMessageAttachment[] = []

    for (const attachment of attachments) {
        if (attachment.public === false) {
            failed.push(attachment)
            continue
        }

        if (isImage(attachment)) {
            images.push(attachment)
        }

        if (
            isProductAttachment(attachment) ||
            isDiscountOfferAttachment(attachment)
        ) {
            linked.push(attachment)
        } else {
            regular.push(attachment)
        }
    }

    return {
        failed,
        linked,
        regular,
        images,
    }
}

export function MessageAttachments({
    item,
    attachmentsLabel = 'Attachments',
}: MessageAttachmentsProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState(0)

    const attachments = item.data.attachments
    if (!attachments || attachments.length === 0) return null

    const {
        failed: failedAttachments,
        linked: linkedAttachments,
        regular: regularAttachments,
        images,
    } = partitionAttachments(attachments)

    function openLightbox(attachment: TicketMessageAttachment) {
        const index = images.findIndex((img) => img.url === attachment.url)
        if (index < 0) {
            return
        }

        setCurrentImage(index)
        setIsLightboxOpen(true)
        shortcutManager.pause()
    }

    function closeLightbox() {
        setIsLightboxOpen(false)
        shortcutManager.unpause()
    }

    return (
        <Box flexDirection="column" gap="xs">
            {failedAttachments.length > 0 && (
                <Banner
                    isClosable={false}
                    icon={IconName.TriangleWarning}
                    description={`There are ${failedAttachments.length} attachment(s) that couldn't be downloaded.`}
                />
            )}
            {linkedAttachments.length > 0 && (
                <Box flexDirection="column" gap="xs">
                    <SectionHeader
                        icon={IconName.LinkHorizontal}
                        label="Linked products"
                    />
                    <Box flexWrap="wrap" gap="xs">
                        {linkedAttachments.map((attachment, idx) =>
                            isProductAttachment(attachment) ? (
                                <ProductAttachment
                                    key={`${attachment.url}-${idx}`}
                                    attachment={attachment}
                                />
                            ) : (
                                <DiscountOfferAttachment
                                    key={`${attachment.url}-${idx}`}
                                    attachment={attachment}
                                />
                            ),
                        )}
                    </Box>
                </Box>
            )}
            {regularAttachments.length > 0 && (
                <Box flexDirection="column" gap="xs">
                    <SectionHeader
                        icon={IconName.PaperclipAttachment}
                        label={attachmentsLabel}
                    />
                    <Box flexWrap="wrap" gap="xs">
                        {regularAttachments.map((attachment, idx) => (
                            <Attachment
                                key={`${attachment.url}-${idx}`}
                                attachment={attachment}
                                onImageClick={openLightbox}
                            />
                        ))}
                    </Box>
                </Box>
            )}
            <YetAnotherLightbox
                open={isLightboxOpen}
                index={currentImage}
                close={closeLightbox}
                slides={images.map((img) => ({
                    src: replaceAttachmentURL(img.url),
                    alt: img.name ?? 'Image attachment',
                    title: img.name,
                }))}
                plugins={[Thumbnails]}
            />
        </Box>
    )
}

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
    TicketThreadRegularMessageItem,
} from '../../../hooks/messages/types'
import { Attachment } from './Attachment'
import { isImage } from './utils/image'

type MessageAttachmentsProps = {
    item: TicketThreadRegularMessageItem | TicketThreadAiAgentMessageItem
}

export function MessageAttachments({ item }: MessageAttachmentsProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [currentImage, setCurrentImage] = useState(0)

    const attachments = item.data.attachments
    if (!attachments || attachments.length === 0) return null

    const failedAttachments = attachments.filter((a) => a.public === false)
    const publicAttachments = attachments.filter((a) => a.public !== false)
    const images = publicAttachments.filter(isImage)

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
            <Box alignItems="center" gap="xxxxs">
                <Icon
                    name={IconName.PaperclipAttachment}
                    size="sm"
                    color="content-neutral-secondary"
                />
                <Text color="content-neutral-secondary">Attachments</Text>
            </Box>
            <Box flexWrap="wrap" gap="xs">
                {publicAttachments.map((attachment, idx) => (
                    <Attachment
                        key={`${attachment.url}-${idx}`}
                        attachment={attachment}
                        onImageClick={openLightbox}
                    />
                ))}
            </Box>
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

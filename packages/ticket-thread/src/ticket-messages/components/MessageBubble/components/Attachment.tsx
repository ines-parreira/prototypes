import type { MouseEvent } from 'react'

import { replaceAttachmentURL } from '@repo/utils'
import cn from 'classnames'

import {
    Box,
    Icon,
    Image,
    Text,
    TextVariant,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'
import type { TicketMessageAttachment } from '@gorgias/helpdesk-types'

import { getFileExtension, isImage } from './utils/image'

import css from './Attachment.less'

type AttachmentProps = {
    attachment: TicketMessageAttachment
    onImageClick: (attachment: TicketMessageAttachment) => void
}

export function Attachment({ attachment, onImageClick }: AttachmentProps) {
    const imageAttachment = isImage(attachment)
    const attachmentUrl = replaceAttachmentURL(attachment.url) || '#'

    function handleImageLinkClick(event: MouseEvent<HTMLAnchorElement>) {
        if (
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey
        ) {
            return
        }

        event.preventDefault()
        onImageClick(attachment)
    }

    return (
        <Tooltip
            trigger={() => {
                return imageAttachment ? (
                    <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={attachment.name ?? 'Image attachment'}
                        onClick={handleImageLinkClick}
                    >
                        <Image
                            src={
                                replaceAttachmentURL(
                                    attachment.url,
                                    '120x80',
                                ) ?? ''
                            }
                            alt={attachment.name ?? 'Image attachment'}
                            fit="cover"
                            className={cn(
                                css.cardSurface,
                                css.attachment,
                                css.preview,
                            )}
                            fallback={
                                <Icon
                                    name="media-image"
                                    size="md"
                                    color="content-neutral-secondary"
                                />
                            }
                        />
                    </a>
                ) : (
                    <a
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(css.cardSurface, css.attachment)}
                        aria-label={attachment.name ?? 'Attachment'}
                    >
                        <Box
                            className={css.itemMeta}
                            alignItems="center"
                            gap="xxxs"
                        >
                            <Icon
                                name="file-document"
                                size="md"
                                color="content-neutral-default"
                            />
                            <Box
                                flexDirection="column"
                                className={css.textStack}
                            >
                                <Text
                                    size="xs"
                                    variant={TextVariant.Bold}
                                    overflow="ellipsis"
                                    color="content-neutral-default"
                                >
                                    {attachment.name}
                                </Text>
                                <Text
                                    size="xs"
                                    color="content-neutral-secondary"
                                >
                                    {getFileExtension(attachment.name)}
                                </Text>
                            </Box>
                        </Box>
                    </a>
                )
            }}
        >
            {attachment.name && (
                <TooltipContent
                    title={attachment.name}
                    caption="Click to view"
                />
            )}
        </Tooltip>
    )
}

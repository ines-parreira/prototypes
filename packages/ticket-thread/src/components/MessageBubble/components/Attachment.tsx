import { replaceAttachmentURL } from '@repo/utils'
import cn from 'classnames'

import {
    Box,
    Icon,
    IconName,
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

    return (
        <Tooltip
            trigger={() => {
                return imageAttachment ? (
                    <Image
                        src={
                            replaceAttachmentURL(attachment.url, '120x80') ?? ''
                        }
                        alt={attachment.name ?? 'Image attachment'}
                        width="40px"
                        height="40px"
                        fit="cover"
                        className={cn(css.item, css.preview)}
                        aria-label={attachment.name ?? 'Image attachment'}
                        onClick={() => onImageClick(attachment)}
                        fallback={
                            <Icon
                                name={IconName.MediaImage}
                                size="md"
                                color="content-neutral-secondary"
                            />
                        }
                    />
                ) : (
                    <a
                        href={replaceAttachmentURL(attachment.url) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.item}
                        aria-label={attachment.name ?? 'Attachment'}
                    >
                        <Box
                            className={css.itemMeta}
                            alignItems="center"
                            gap="xxxs"
                        >
                            <Icon
                                name={IconName.FileDocument}
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

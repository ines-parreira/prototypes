import { Box, Icon, Tag } from '@gorgias/axiom'

import type { MacroActionAttachment } from 'models/macroAction/types'

function getAttachmentLabel(attachment: MacroActionAttachment): string {
    if (attachment.name) {
        return attachment.name
    }

    if (attachment.url) {
        const parts = attachment.url.split('/')
        const lastSegment = parts[parts.length - 1]

        if (lastSegment) {
            return lastSegment
        }
    }

    return 'Attachment'
}

type AttachmentsPreviewProps = {
    attachments?: MacroActionAttachment[]
}

export function AttachmentsPreview({ attachments }: AttachmentsPreviewProps) {
    return (
        <Box flexDirection="row" flexWrap="wrap" gap="xxxs">
            {attachments?.map((attachment) => (
                <Tag
                    key={`${attachment.url}-${attachment.name ?? 'file'}`}
                    leadingSlot={
                        <Icon alt="" name="paperclip-attachment" size="xs" />
                    }
                    size="sm"
                >
                    {getAttachmentLabel(attachment)}
                </Tag>
            ))}
        </Box>
    )
}

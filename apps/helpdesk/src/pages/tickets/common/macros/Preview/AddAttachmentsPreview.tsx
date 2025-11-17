import { LegacyBadge as Badge } from '@gorgias/axiom'
import type { File, MacroAction } from '@gorgias/helpdesk-types'

import { fileIconFromContentType } from 'pages/tickets/common/utils'

export const AddAttachmentsPreview = ({
    attachmentAction,
}: {
    attachmentAction?: MacroAction
}) => {
    if (!attachmentAction) return null

    return (
        <div className="mb-3">
            <strong className="text-muted mr-2">Attach files:</strong>
            {(
                attachmentAction.arguments as { attachments: File[] }
            ).attachments.map((file, index: number) => (
                <Badge key={index} color="secondary" className="mr-1 mb-1">
                    <i className="material-icons mr-2">
                        {fileIconFromContentType(file.content_type ?? '')}
                    </i>
                    {file.name}
                </Badge>
            ))}
        </div>
    )
}

import { Text } from '@gorgias/axiom'

import css from '../TicketReplyActionHelpdeskV2.less'

type ActionContentPreviewProps = {
    bodyHtml?: string
    bodyText?: string
}

export function ActionContentPreview({
    bodyHtml,
    bodyText,
}: ActionContentPreviewProps) {
    if (bodyHtml) {
        return (
            <div
                className={css.htmlPreview}
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
        )
    }

    if (bodyText) {
        return (
            <Text size="sm" className={css.bodyText}>
                {bodyText}
            </Text>
        )
    }

    return (
        <Text size="sm" color="content-neutral-secondary">
            No preview available
        </Text>
    )
}

import { Box, Tag } from '@gorgias/axiom'

import { ActionContentPreview } from './ActionContentPreview'

function hasRenderableValue(value: unknown): boolean {
    if (value === null || value === undefined) {
        return false
    }

    if (typeof value === 'string') {
        return value.trim().length > 0
    }

    return true
}

type ForwardByEmailPreviewProps = {
    to?: string
    cc?: string
    bcc?: string
    from?: string
    bodyHtml?: string
    bodyText?: string
}

export function ForwardByEmailPreview({
    to,
    cc,
    bcc,
    from,
    bodyHtml,
    bodyText,
}: ForwardByEmailPreviewProps) {
    const recipients = [
        ['To', to],
        ['Cc', cc],
        ['Bcc', bcc],
        ['From', from],
    ].filter(([, value]) => hasRenderableValue(value))

    return (
        <Box flexDirection="column" gap="xs">
            {!!recipients.length && (
                <Box flexDirection="row" flexWrap="wrap" gap="xxxs">
                    {recipients.map(([label, value]) => (
                        <Tag key={label} size="sm">
                            {`${label}: ${String(value)}`}
                        </Tag>
                    ))}
                </Box>
            )}
            <ActionContentPreview bodyHtml={bodyHtml} bodyText={bodyText} />
        </Box>
    )
}

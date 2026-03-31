import { sanitizeHtmlDefault } from '@repo/utils'

import { Text } from '@gorgias/axiom'

import css from './TicketMessageErrorContent.less'

type TicketMessageErrorContentProps = {
    content?: string
}

export function TicketMessageErrorContent({
    content,
}: TicketMessageErrorContentProps) {
    if (!content) {
        return null
    }

    return (
        <Text size="sm">
            <span
                dangerouslySetInnerHTML={{
                    __html: sanitizeHtmlDefault(content),
                }}
                className={css.content}
            />
        </Text>
    )
}

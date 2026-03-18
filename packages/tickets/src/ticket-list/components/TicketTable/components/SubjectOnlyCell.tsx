import { DataTableBaseCell, OverflowTooltip, Text } from '@gorgias/axiom'
import type {
    TicketCompact,
    TicketTranslationCompact,
} from '@gorgias/helpdesk-types'

import { useTicketDisplayData } from '../../../hooks/useTicketDisplayData'

type Props = {
    ticket: TicketCompact
    translation: TicketTranslationCompact | undefined
    showTranslatedContent: boolean
}

export function SubjectOnlyCell({
    ticket,
    translation,
    showTranslatedContent,
}: Props) {
    const { displaySubject } = useTicketDisplayData({
        ticket,
        translation,
        showTranslatedContent,
    })

    return (
        <DataTableBaseCell alignItems="stretch">
            <OverflowTooltip>
                <Text
                    overflow="ellipsis"
                    variant={ticket.is_unread ? 'bold' : 'regular'}
                >
                    {displaySubject}
                </Text>
            </OverflowTooltip>
        </DataTableBaseCell>
    )
}

import type { UserDateTimePreferences } from '@repo/preferences'

import {
    DataTableBaseCell,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { formatTicketTableDateTime } from '../../../utils/formatTicketTableDateTime'
import type { TicketTableCellLinkProps } from './TicketTableCellLink'
import { TicketTableCellLink } from './TicketTableCellLink'

type Props = {
    datetime: string | null | undefined
    preferences: UserDateTimePreferences
    linkProps?: Omit<TicketTableCellLinkProps, 'children'>
}

export function DateTimeCell({ datetime, preferences, linkProps }: Props) {
    const formattedDatetime = formatTicketTableDateTime(datetime, preferences)

    const content = !formattedDatetime ? null : (
        <Tooltip
            placement="right"
            trigger={() => (
                <Text overflow="ellipsis">{formattedDatetime.cellLabel}</Text>
            )}
        >
            <TooltipContent title={formattedDatetime.tooltipLabel} />
        </Tooltip>
    )

    if (linkProps) {
        return (
            <TicketTableCellLink {...linkProps} alignItems="stretch">
                {content}
            </TicketTableCellLink>
        )
    }

    return <DataTableBaseCell alignItems="stretch">{content}</DataTableBaseCell>
}

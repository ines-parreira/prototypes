import type { UserDateTimePreferences } from '@repo/preferences'

import {
    DataTableBaseCell,
    Text,
    Tooltip,
    TooltipContent,
} from '@gorgias/axiom'

import { formatTicketTableDateTime } from '../../../utils/formatTicketTableDateTime'

type Props = {
    datetime: string | null | undefined
    preferences: UserDateTimePreferences
}

export function DateTimeCell({ datetime, preferences }: Props) {
    const formattedDatetime = formatTicketTableDateTime(datetime, preferences)

    if (!formattedDatetime) {
        return <DataTableBaseCell>{null}</DataTableBaseCell>
    }

    return (
        <DataTableBaseCell alignItems="stretch">
            <Tooltip
                trigger={() => (
                    <Text overflow="ellipsis">
                        {formattedDatetime.cellLabel}
                    </Text>
                )}
            >
                <TooltipContent title={formattedDatetime.tooltipLabel} />
            </Tooltip>
        </DataTableBaseCell>
    )
}

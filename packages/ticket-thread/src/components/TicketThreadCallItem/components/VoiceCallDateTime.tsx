import { useUserDateTimePreferences } from '@repo/preferences'
import {
    DateAndTimeFormatting,
    formatDatetime,
    getDateAndTimeFormat,
} from '@repo/utils'

import { Box, Text } from '@gorgias/axiom'

type VoiceCallDateTimeProps = {
    datetime: string
}

export function VoiceCallDateTime({ datetime }: VoiceCallDateTimeProps) {
    const { dateFormat, timeFormat } = useUserDateTimePreferences()
    const format = getDateAndTimeFormat(
        dateFormat,
        timeFormat,
        DateAndTimeFormatting.CompactDateWithTime,
    )

    return (
        <Box
            as="span"
            style={{ whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right' }}
        >
            <Text as="span" size="xs" color="content-neutral-secondary">
                {formatDatetime(datetime, format)}
            </Text>
        </Box>
    )
}

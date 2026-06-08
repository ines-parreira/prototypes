import React, { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import { useNow } from '@repo/hooks'
import moment from 'moment'

import { shortenRelativeDurationLabel } from 'utils/date'

type Props = {
    datetime: string
}

export default function RelativeTime({ datetime }: Props) {
    useNow(Duration.seconds(10))
    const m = useMemo(() => moment(new Date(datetime)), [datetime])

    return <>{shortenRelativeDurationLabel(m.fromNow())}</>
}

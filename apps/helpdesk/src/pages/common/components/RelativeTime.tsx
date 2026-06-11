import React, { useMemo } from 'react'
import { Duration } from '@gorgias/toolkit'

import moment from 'moment'
import { useNow } from '@gorgias/toolkit-react'

import { shortenRelativeDurationLabel } from 'utils/date'

type Props = {
    datetime: string
}

export function RelativeTime({ datetime }: Props) {
    useNow(Duration.seconds(10))
    const m = useMemo(() => moment(new Date(datetime)), [datetime])

    return <>{shortenRelativeDurationLabel(m.fromNow())}</>
}

import moment from 'moment'
import React, {useMemo} from 'react'

import {useNow} from 'hooks/useNow'
import {shortenRelativeDurationLabel} from 'utils/date'

type Props = {
    datetime: string
}

export default function RelativeTime({datetime}: Props) {
    useNow(10000)
    const m = useMemo(() => moment(new Date(datetime)), [datetime])

    return <>{shortenRelativeDurationLabel(m.fromNow())}</>
}

import { useMemo } from 'react'

import { List, Map } from 'immutable'
import moment from 'moment'

export default function useLastMessageDatetimeAfterMount(elements: List<any>) {
    return useMemo(() => {
        if (elements.isEmpty()) return null
        const datetime = (elements.last() as Map<any, any>).get(
            'created_datetime',
        )
        return moment(datetime)
        // we never want this to re-run, so we disable eslint here
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

import {useEffect, useState} from 'react'

import TicketUpdatesManager from '../TicketUpdatesManager'
import {TicketPartial} from '../types'

export default function useTicketPartials(viewId: number) {
    const [partials, setPartials] = useState<TicketPartial[]>([])

    useEffect(() => {
        const client = new TicketUpdatesManager(viewId)
        return client.subscribe(setPartials)
    }, [viewId])

    return {partials}
}

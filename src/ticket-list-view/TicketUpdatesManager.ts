import {CursorMeta} from 'models/api/types'

import {MockedTickets, Response} from './mockUtils'

import type {TicketPartial} from './types'
import transformApiTicketPartial from './utils/transformApiTicketPartial'

export type Listener = (
    tickets: TicketPartial[],
    cursor: CursorMeta['next_cursor']
) => void
export type Unsubscribe = () => void

const POLLING_INTERVAL = 2000

export default class TicketUpdatesManager {
    private mockedTickets: MockedTickets | null = null

    private initialLoaded = false
    private listener: Listener | null = null
    private loading = false
    private nextCursor: CursorMeta['next_cursor'] = null
    private tickets: TicketPartial[] = []
    private viewId: number

    constructor(viewId: number) {
        this.viewId = viewId
    }

    async loadMore() {
        await this.getPage()
    }

    subscribe(listener: Listener): Unsubscribe {
        this.listener = listener
        this.mockedTickets = new MockedTickets()

        void this.start()

        return () => {
            this.mockedTickets?.stopPolling()
            this.mockedTickets = null
            this.listener = null
        }
    }

    private async getPage() {
        if (
            !this.mockedTickets ||
            !this.listener ||
            this.loading ||
            (this.initialLoaded && !this.nextCursor)
        ) {
            return
        }

        this.loading = true

        const response = await this.mockedTickets.getPage()
        this.nextCursor = response.meta.next_cursor
        this.tickets = [
            ...this.tickets,
            ...response.data.map(transformApiTicketPartial),
        ]
        this.listener(this.tickets, this.nextCursor)

        this.loading = false
        this.initialLoaded = true
    }

    private receiveUpdates = (response: Response) => {
        if (!this.listener) return

        this.nextCursor = response.meta.next_cursor
        this.tickets = response.data.map(transformApiTicketPartial)

        this.listener(this.tickets, this.nextCursor)
    }

    private async start() {
        if (!this.mockedTickets) return

        await this.getPage()

        this.mockedTickets.startPolling(this.receiveUpdates, POLLING_INTERVAL)
    }
}

import {CursorMeta} from 'models/api/types'

import {MockedTickets, Response} from './mockUtils'

import type {TicketPartial} from './types'

export type Listener = (tickets: TicketPartial[]) => void
export type Unsubscribe = () => void

const POLLING_INTERVAL = 2000

export default class TicketUpdatesManager {
    private mockedTickets: MockedTickets | null = null

    private nextCursor: CursorMeta['next_cursor'] = null
    private listener: Listener | null = null
    private tickets: TicketPartial[] = []
    private viewId: number

    constructor(viewId: number) {
        this.viewId = viewId
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
        if (!this.mockedTickets || !this.listener) return

        const response = await this.mockedTickets.getPage()
        this.nextCursor = response.meta.next_cursor
        this.tickets = response.data

        this.listener(this.tickets)
    }

    private receiveUpdates = (response: Response) => {
        if (!this.listener) return

        this.nextCursor = response.meta.next_cursor
        this.tickets = response.data

        this.listener(this.tickets)
    }

    private async start() {
        if (!this.mockedTickets) return

        await this.getPage()

        this.mockedTickets.startPolling(this.receiveUpdates, POLLING_INTERVAL)
    }
}

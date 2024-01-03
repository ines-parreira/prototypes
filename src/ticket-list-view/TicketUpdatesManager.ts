import {appQueryClient} from 'api/queryClient'
import {CursorMeta} from 'models/api/types'
import {viewItemsDefinitionKeys} from 'models/view/queries'
import {getViewTicketUpdates} from 'models/view/resources'

import {SortOrder} from './hooks/useSortOrder'
import type {TicketPartial} from './types'
import transformApiTicketPartial from './utils/transformApiTicketPartial'

export type Listener = (
    tickets: TicketPartial[],
    cursor: CursorMeta['next_cursor']
) => void
export type Unsubscribe = () => void

const PAGE_LIMIT = 25
const POLLING_INTERVAL = 5000

export default class TicketUpdatesManager {
    private initialLoaded = false
    private latestIndex = 0
    private latestTimestamp = 0
    private listener: Listener | null = null
    private loading = false
    private nextCursor: CursorMeta['next_cursor'] = null
    private sortOrder: SortOrder
    private tickets: TicketPartial[] = []
    private viewId: number

    constructor(viewId: number, sortOrder: SortOrder) {
        this.viewId = viewId
        this.sortOrder = sortOrder
    }

    async loadMore() {
        await this.getPage()
    }

    setLatest = (index: number, timestamp: number) => {
        this.latestIndex = index
        this.latestTimestamp = Math.ceil(timestamp / 1000)
    }

    subscribe(listener: Listener): Unsubscribe {
        this.listener = listener

        void this.start()

        return () => {
            this.listener = null
        }
    }

    private async getPage() {
        if (
            !this.listener ||
            this.loading ||
            (this.initialLoaded && !this.nextCursor)
        ) {
            return
        }

        this.loading = true

        const response = await appQueryClient.fetchQuery({
            queryFn: () =>
                getViewTicketUpdates(this.viewId, {
                    cursor: this.nextCursor,
                    limit: PAGE_LIMIT,
                    order_by: this.sortOrder,
                }),
            queryKey: viewItemsDefinitionKeys.updates(this.viewId),
        })

        const {data, meta} = response.data
        this.nextCursor = meta.next_cursor
        this.tickets = [...this.tickets, ...data.map(transformApiTicketPartial)]
        this.listener(this.tickets, this.nextCursor)

        this.initialLoaded = true
        this.loading = false
    }

    private poll = async () => {
        if (!this.listener) return

        const response = await appQueryClient.fetchQuery({
            queryFn: () =>
                getViewTicketUpdates(this.viewId, {
                    order_by: this.sortOrder,
                    up_to_timestamp: this.latestTimestamp,
                }),
            queryKey: viewItemsDefinitionKeys.updates(this.viewId),
        })

        const {data} = response.data
        const newTickets = [...this.tickets]
        newTickets.splice(
            0,
            this.latestIndex,
            ...data.map(transformApiTicketPartial)
        )

        this.tickets = newTickets
        this.listener(this.tickets, this.nextCursor)
    }

    private async start() {
        await this.getPage()

        const next = () => {
            void this.poll()
            setTimeout(next, POLLING_INTERVAL)
        }
        setTimeout(next, POLLING_INTERVAL)
    }
}

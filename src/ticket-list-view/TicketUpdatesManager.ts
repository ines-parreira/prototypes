/* istanbul ignore file */
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
    private isPaused: boolean = false
    private latestDatetime: number | string | null = null
    private latestIndex = 0
    private listener: Listener | null = null
    private loading = false
    private nextCursor: CursorMeta['next_cursor'] = null
    private pollTimeout: ReturnType<typeof setTimeout> | null = null
    private sortOrder: SortOrder
    private tickets: TicketPartial[] = []
    private viewId: number

    constructor(viewId: number, sortOrder: SortOrder) {
        this.viewId = viewId
        this.sortOrder = sortOrder
    }

    async loadMore() {
        if (!this.listener || this.loading) return

        this.loading = true

        const {data, meta} = await this.getPage(this.sortOrder, this.nextCursor)
        this.nextCursor = meta.next_cursor
        this.tickets = [...this.tickets, ...data.map(transformApiTicketPartial)]
        this.listener?.(this.tickets, this.nextCursor)

        this.loading = false
    }

    pause = () => {
        this.isPaused = true
    }

    resume = () => {
        this.isPaused = false
    }

    setLatest = (index: number, datetime: number | string | null) => {
        this.latestIndex = index
        this.latestDatetime = datetime
    }

    subscribe(listener: Listener): Unsubscribe {
        this.listener = listener

        void this.start()

        return () => {
            this.listener = null
            if (this.pollTimeout) {
                clearTimeout(this.pollTimeout)
            }
        }
    }

    private async getPage(
        sortOrder: SortOrder,
        cursor: CursorMeta['next_cursor']
    ) {
        const response = await appQueryClient.fetchQuery({
            queryFn: () =>
                getViewTicketUpdates(this.viewId, {
                    cursor,
                    limit: PAGE_LIMIT,
                    order_by: sortOrder,
                }),
            queryKey: viewItemsDefinitionKeys.updates(this.viewId),
        })

        return response.data
    }

    private async getTicketsUpTo(
        sortOrder: SortOrder,
        datetime: number | string
    ) {
        const response = await appQueryClient.fetchQuery({
            queryFn: () =>
                getViewTicketUpdates(this.viewId, {
                    order_by: sortOrder,
                    up_to_datetime:
                        datetime === Infinity ? undefined : datetime,
                }),
            queryKey: viewItemsDefinitionKeys.updates(this.viewId),
        })

        return response.data
    }

    private async poll() {
        if (!this.listener || this.loading || this.isPaused) return

        // we want to get the full first page if:
        // - if the last visible item is lower than the PAGE_LIMIT -2, since that's
        //   when we would fetch the next page
        // - the amount of tickets in the view is lower than the PAGE_LIMIT, OR
        // - if the amount of tickets is equal to the PAGE_LIMIT and there is no cursor
        // in this case, we simply replace the full tickets array that we know about
        if (
            (this.latestIndex > 0 && this.latestIndex < PAGE_LIMIT - 2) ||
            this.tickets.length < PAGE_LIMIT ||
            (this.tickets.length === PAGE_LIMIT && !this.nextCursor)
        ) {
            this.loading = true

            try {
                const {data, meta} = await this.getPage(this.sortOrder, null)
                this.nextCursor = meta.next_cursor
                this.tickets = data.map(transformApiTicketPartial)
            } catch (err) {}

            if (this.listener && !this.isPaused) {
                this.listener(this.tickets, this.nextCursor)
            }

            this.loading = false
            return
        }

        // if the latest timestamp is not known yet (since this comes from the data
        // request), we just skip this polling attempt
        if (!this.latestDatetime) return

        this.loading = true

        try {
            const {data} = await this.getTicketsUpTo(
                this.sortOrder,
                this.latestDatetime
            )

            const newTickets = data.map(transformApiTicketPartial)
            const newTicketIds = newTickets.reduce(
                (acc, t) => ({...acc, [t.id]: true}),
                {} as {[k: number]: boolean}
            )
            const oldTickets = this.tickets
                .slice(this.latestIndex + 1)
                .filter((t) => !newTicketIds[t.id])

            this.tickets = [...newTickets, ...oldTickets]
        } catch (err) {}

        if (this.listener && !this.isPaused) {
            this.listener(this.tickets, this.nextCursor)
        }
        this.loading = false
    }

    private start() {
        const next = () => {
            void this.poll()
            this.pollTimeout = setTimeout(next, POLLING_INTERVAL)
        }

        next()
    }
}

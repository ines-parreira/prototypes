import {appQueryClient} from 'api/queryClient'
import {CursorMeta} from 'models/api/types'
import {viewItemsDefinitionKeys} from 'models/view/queries'
import {getViewTicketUpdates} from 'models/view/resources'

import type {TicketPartial} from './types'
import transformApiTicketPartial from './utils/transformApiTicketPartial'

export type Listener = (
    tickets: TicketPartial[],
    cursor: CursorMeta['next_cursor']
) => void
export type Unsubscribe = () => void

const PAGE_LIMIT = 25

export default class TicketUpdatesManager {
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
                    order_by: 'created_datetime:asc',
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

    private async start() {
        await this.getPage()
    }
}

/**
 * This file is purely for mocking view items
 * polling until the backend is ready. Once the
 * backend is hooked up, this file can be deleted.
 */
import {ApiListResponseCursorPagination} from 'models/api/types'
import {TicketPartial as ApiTicketPartial} from 'models/ticket/types'

export type Response = ApiListResponseCursorPagination<ApiTicketPartial[]>

type Listener = (response: Response) => void

enum MockAction {
    None = 'NONE',
    AddTicket = 'ADD_TICKET',
    RemoveTicket = 'REMOVE_TICKET',
    UpdateTicket = 'UPDATE_TICKET',
}

const mockActions = Object.values(MockAction)

function getRandomNumber(max: number) {
    return Math.floor(Math.random() * max)
}

function getRandomAction(): MockAction {
    const index = getRandomNumber(mockActions.length)
    return mockActions[index] as MockAction
}

async function wait(timeout: number) {
    await new Promise((resolve) => {
        setTimeout(resolve, timeout)
    })
}

function randomId() {
    const min = 100000000
    const max = 999999999
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateTicket(): ApiTicketPartial {
    return {
        id: randomId(),
        updated_datetime: new Date().toString(),
    }
}

export class MockedTickets {
    private intervalId: ReturnType<typeof setInterval> | undefined
    private listener: Listener | null = null
    private pageCount = 0
    private tickets: ApiTicketPartial[] = []

    async getPage() {
        await wait(100)

        const tickets: ApiTicketPartial[] = []
        for (let i = 0; i < 25; i++) {
            tickets.push(generateTicket())
        }

        this.tickets = [...this.tickets, ...tickets]

        const response: ApiListResponseCursorPagination<ApiTicketPartial[]> = {
            data: tickets,
            meta: {
                next_cursor: this.pageCount >= 3 ? null : 'random-cursor',
                prev_cursor: null,
                total_resources: null,
            },
            object: '',
            uri: '',
        }

        this.pageCount = this.pageCount + 1

        return response
    }

    startPolling(listener: Listener, interval: number) {
        this.listener = listener

        this.intervalId = setInterval(() => {
            const action = getRandomAction()
            const index = getRandomNumber(this.tickets.length)
            if (action === MockAction.AddTicket) {
                this.addTicket(index)
            } else if (action === MockAction.RemoveTicket) {
                this.removeTicket(index)
            } else if (action === MockAction.UpdateTicket) {
                this.updateTicket(index)
            }
        }, interval)
    }

    stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId)
        }

        this.listener = null
    }

    private notify() {
        if (!this.listener) return

        const response: ApiListResponseCursorPagination<ApiTicketPartial[]> = {
            data: this.tickets,
            meta: {
                next_cursor: this.pageCount >= 3 ? null : 'random-cursor',
                prev_cursor: null,
                total_resources: null,
            },
            object: '',
            uri: '',
        }

        this.listener(response)
    }

    private addTicket(index: number) {
        this.tickets = [...this.tickets]
        this.tickets.splice(index, 0, generateTicket())
        this.notify()
    }

    private removeTicket(index: number) {
        if (!this.listener) return

        this.tickets = this.tickets.filter((_ticket, i) => i !== index)
        this.notify()
    }

    private updateTicket(index: number) {
        if (!this.listener) return

        this.tickets = this.tickets.map((ticket, i) =>
            i !== index
                ? ticket
                : {
                      ...ticket,
                      updated_datetime: new Date().toString(),
                  }
        )
        this.notify()
    }
}

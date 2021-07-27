export class TicketMessageInvalidSendDataError extends Error {
    constructor() {
        super('Ticket message send data is invalid.')
    }
}

export class TicketMessageActionValidationError extends Error {
    reason: string

    constructor(reason: string) {
        super('Action validation error')
        this.reason = reason
    }
}

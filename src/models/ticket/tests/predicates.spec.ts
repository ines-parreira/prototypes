import {TicketMessageSourceType} from '../../../business/types/ticket'
import {
    hasFailedAction,
    hasPendingAction,
    isFailed,
    isPending,
} from '../predicates'
import {TicketMessage, ActionStatus} from '../types'

import {action as defaultAction, message as defaultMessage} from './mocks'

describe('predicates', () => {
    describe('hasFailedAction', () => {
        it('should return false if no actions', () => {
            expect(hasFailedAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [defaultAction],
            }
            expect(hasFailedAction(message)).toBe(false)
        })

        it('should return true if has failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(hasFailedAction(message)).toBe(true)
        })
    })

    describe('hasPendingAction', () => {
        it('should return false if no actions', () => {
            expect(hasPendingAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [defaultAction],
            }
            expect(hasPendingAction(message)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(hasPendingAction(message)).toBe(true)
        })
    })

    describe('isPending', () => {
        it('should return false if no actions', () => {
            expect(isPending(defaultMessage)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return false if has failed and pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                    {
                        ...defaultAction,
                        status: ActionStatus.Pending,
                    },
                ],
            }
            expect(isPending(message)).toBe(false)
        })

        it('should return true if message is pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return true if message is pending and has failed actions', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isPending(message)).toBe(true)
        })

        it('should return false if message is an email and isPending', () => {
            const message = ({
                ...defaultMessage,
                isPending: true,
                source: {
                    type: TicketMessageSourceType.Email,
                },
            } as unknown) as TicketMessage
            expect(isPending(message)).toBe(false)
        })
    })

    describe('isFailed', () => {
        it('should return false if no actions', () => {
            expect(isFailed(defaultMessage)).toBe(false)
        })

        it('should return true if it has failed datetime', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                failed_datetime: '2018-01-01T09:30:11.000Z',
            }
            expect(isFailed(message)).toBe(true)
        })

        it('should return true if it has failed action', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isFailed(message)).toBe(true)
        })

        it('should return false if it has failed action and is pending', () => {
            const message: TicketMessage = {
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: ActionStatus.Error,
                    },
                ],
            }
            expect(isFailed(message)).toBe(false)
        })
    })
})

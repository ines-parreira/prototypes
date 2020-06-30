//@flow
import {
    hasFailedAction,
    hasPendingAction,
    isFailed,
    isPending,
} from '../predicates'
import type {TicketMessage} from '../types'

import {action as defaultAction, message as defaultMessage} from './mocks'

describe('predicates', () => {
    describe('hasFailedAction', () => {
        it('should return false if no actions', () => {
            expect(hasFailedAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [defaultAction],
            }: any)
            expect(hasFailedAction(message)).toBe(false)
        })

        it('should return true if has failed action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: 'error',
                    },
                ],
            }: any)
            expect(hasFailedAction(message)).toBe(true)
        })
    })

    describe('hasPendingAction', () => {
        it('should return false if no actions', () => {
            expect(hasPendingAction(defaultMessage)).toBe(false)
        })

        it('should return false if no failed action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [defaultAction],
            }: any)
            expect(hasPendingAction(message)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [
                    defaultAction,
                    {
                        ...defaultAction,
                        status: 'pending',
                    },
                ],
            }: any)
            expect(hasPendingAction(message)).toBe(true)
        })
    })

    describe('isPending', () => {
        it('should return false if no actions', () => {
            expect(isPending(defaultMessage)).toBe(false)
        })

        it('should return true if has pending action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: 'pending',
                    },
                ],
            }: any)
            expect(isPending(message)).toBe(true)
        })

        it('should return false if has failed and pending', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: 'error',
                    },
                    {
                        ...defaultAction,
                        status: 'pending',
                    },
                ],
            }: any)
            expect(isPending(message)).toBe(false)
        })

        it('should return true if message is pending', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                isPending: true,
            }: any)
            expect(isPending(message)).toBe(true)
        })

        it('should return true if message is pending and has failed actions', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: 'error',
                    },
                ],
            }: any)
            expect(isPending(message)).toBe(true)
        })

        it('should return false if message is an email and isPending', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                isPending: true,
                source: {
                    type: 'email',
                },
            }: any)
            expect(isPending(message)).toBe(false)
        })
    })

    describe('isFailed', () => {
        it('should return false if no actions', () => {
            expect(isFailed(defaultMessage)).toBe(false)
        })

        it('should return true if it has failed datetime', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                failed_datetime: '2018-01-01T09:30:11.000Z',
            }: any)
            expect(isFailed(message)).toBe(true)
        })

        it('should return true if it has failed action', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                actions: [
                    {
                        ...defaultAction,
                        status: 'error',
                    },
                ],
            }: any)
            expect(isFailed(message)).toBe(true)
        })

        it('should return false if it has failed action and is pending', () => {
            const message: TicketMessage = ({
                ...defaultMessage,
                isPending: true,
                actions: [
                    {
                        ...defaultAction,
                        status: 'error',
                    },
                ],
            }: any)
            expect(isFailed(message)).toBe(false)
        })
    })
})

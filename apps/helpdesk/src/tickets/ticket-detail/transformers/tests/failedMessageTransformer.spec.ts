import { TicketMessage } from '@gorgias/helpdesk-queries'

import { MacroActionName } from 'models/macroAction/types'
import { Action, ActionStatus } from 'models/ticket/types'

import { TicketElement } from '../../types'
import { failedMessageTransformer } from '../failedMessageTransformer'
import { integrationErrorTransformer } from '../integrationErrorTransformer'

jest.mock('../integrationErrorTransformer')

const mockIntegrationErrorTransformer = jest.mocked(integrationErrorTransformer)

describe('failedMessageTransformer', () => {
    const baseMessageData = {
        id: 1,
        actions: null,
        failed_datetime: '2024-01-01T00:00:00Z',
    } as unknown as TicketMessage

    const baseElement: TicketElement = {
        type: 'message',
        data: baseMessageData,
        datetime: '2024-01-01T00:00:00Z',
        flags: [],
    }

    const failedAction: Action = {
        status: ActionStatus.Error,
        name: MacroActionName.SetStatus,
        title: 'Test Action',
        type: 'user',
        response: {
            msg: 'API error',
            status_code: 500,
            response: 'Internal Server Error',
        },
    }

    beforeEach(() => {
        mockIntegrationErrorTransformer.mockReturnValue({})
    })

    it('should return unchanged elements when no failed messages', () => {
        const elements: TicketElement[] = [
            {
                ...baseElement,
                data: {
                    ...baseMessageData,
                    failed_datetime: null,
                },
            },
            {
                type: 'event',
                data: { type: 'status_changed' },
                datetime: '2024-01-01T00:00:00Z',
                flags: [],
            },
        ]

        const result = failedMessageTransformer(elements)
        expect(result).toEqual(elements)
    })

    it('should add failed flag for message with last_sending_error', () => {
        const elements: TicketElement[] = [
            {
                ...baseElement,
                data: {
                    ...baseMessageData,
                    last_sending_error: {
                        error: 'Connection timeout',
                    },
                },
            },
        ]

        const result = failedMessageTransformer(elements)
        expect(result[0].flags).toContainEqual([
            'failed',
            {
                message: 'Connection timeout',
                failedActions: [],
            },
        ])
    })

    it('should add failed flag for message with failed actions', () => {
        const elements: TicketElement[] = [
            {
                ...baseElement,
                data: {
                    ...baseMessageData,
                    actions: [failedAction],
                },
            },
        ]

        const result = failedMessageTransformer(elements)
        expect(result[0].flags).toContainEqual([
            'failed',
            {
                message: 'Message not sent because action failed.',
                failedActions: [failedAction],
            },
        ])
    })

    it('should use default error message when no specific error is available', () => {
        const elements: TicketElement[] = [baseElement]

        const result = failedMessageTransformer(elements)
        expect(result[0].flags).toContainEqual([
            'failed',
            {
                message: 'This message was not sent.',
                failedActions: [],
            },
        ])
    })

    it('should preserve existing flags when adding failed flag', () => {
        const elements: TicketElement[] = [
            {
                ...baseElement,
                data: {
                    ...baseMessageData,
                    last_sending_error: {
                        error: 'Connection timeout',
                    },
                },
                flags: [
                    [
                        'failed',
                        { message: 'Previous error', failedActions: [] },
                    ],
                ],
            },
        ]

        const result = failedMessageTransformer(elements)
        expect(result[0].flags).toHaveLength(2)
        expect(result[0].flags).toContainEqual([
            'failed',
            { message: 'Previous error', failedActions: [] },
        ])
        expect(result[0].flags).toContainEqual([
            'failed',
            {
                message: 'Connection timeout',
                failedActions: [],
            },
        ])
    })

    it('should include integration error data when integrationErrorTransformer returns some', () => {
        const integrationError = {
            message: 'This is an integration error message',
        }
        mockIntegrationErrorTransformer.mockReturnValue(integrationError)

        const elements: TicketElement[] = [
            {
                ...baseElement,
                data: {
                    ...baseMessageData,
                    last_sending_error: {
                        error: 'Connection timeout',
                    },
                },
            },
        ]

        const result = failedMessageTransformer(elements)
        expect(result[0].flags).toContainEqual([
            'failed',
            {
                message: integrationError.message,
                failedActions: [],
            },
        ])
        expect(mockIntegrationErrorTransformer).toHaveBeenCalledWith(
            elements[0].data,
        )
    })
})

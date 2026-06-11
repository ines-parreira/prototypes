import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { IntegrationType } from '@gorgias/helpdesk-types'

import { useAppSelector } from 'hooks/useAppSelector'
import { WidgetEnvironment } from 'state/widgets/types'

import { useIsIntegrationDisplayable } from '../useIsIntegrationDisplayable'

jest.mock('hooks/useAppSelector', () => ({ useAppSelector: jest.fn() }))

const useAppSelectorMock = useAppSelector as jest.Mock

function mockSelectors({
    customerIntegrations,
    integrations,
    widgetItems,
    sourceIntegrations,
}: {
    customerIntegrations: Record<string, unknown>
    integrations: { id: number }[]
    widgetItems: Array<Record<string, unknown>>
    sourceIntegrations: Record<string, unknown>
}) {
    useAppSelectorMock.mockReturnValueOnce(fromJS(customerIntegrations))
    useAppSelectorMock.mockReturnValueOnce(integrations)
    useAppSelectorMock.mockReturnValueOnce(fromJS({ items: widgetItems }))
    useAppSelectorMock.mockReturnValueOnce(
        fromJS({
            ticket: {
                customer: {
                    integrations: sourceIntegrations,
                },
            },
        }),
    )
}

const smileTicketWidget = {
    type: IntegrationType.Smile,
    context: WidgetEnvironment.Ticket,
    template: {
        type: 'wrapper',
        widgets: [
            {
                type: 'card',
                path: 'customer',
                widgets: [
                    {
                        type: 'text',
                        path: 'points_balance',
                        title: 'Points balance',
                    },
                ],
            },
        ],
    },
}

describe('useIsIntegrationDisplayable', () => {
    it('should return false when no matching integration exists for the customer', () => {
        mockSelectors({
            customerIntegrations: {},
            integrations: [{ id: 70 }],
            widgetItems: [smileTicketWidget],
            sourceIntegrations: {},
        })

        const { result } = renderHook(() =>
            useIsIntegrationDisplayable(IntegrationType.Smile),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when no ticket-context widget of the type exists', () => {
        mockSelectors({
            customerIntegrations: {
                '70': { customer: { points_balance: 1200 } },
            },
            integrations: [{ id: 70 }],
            widgetItems: [
                {
                    ...smileTicketWidget,
                    context: WidgetEnvironment.User,
                },
            ],
            sourceIntegrations: {
                '70': { customer: { points_balance: 1200 } },
            },
        })

        const { result } = renderHook(() =>
            useIsIntegrationDisplayable(IntegrationType.Smile),
        )

        expect(result.current).toBe(false)
    })

    it('should return false when the integration source has no data matching the template', () => {
        mockSelectors({
            customerIntegrations: { '70': {} },
            integrations: [{ id: 70 }],
            widgetItems: [smileTicketWidget],
            sourceIntegrations: { '70': {} },
        })

        const { result } = renderHook(() =>
            useIsIntegrationDisplayable(IntegrationType.Smile),
        )

        expect(result.current).toBe(false)
    })

    it('should return true when the integration source has data matching the template', () => {
        mockSelectors({
            customerIntegrations: {
                '70': { customer: { points_balance: 1200 } },
            },
            integrations: [{ id: 70 }],
            widgetItems: [smileTicketWidget],
            sourceIntegrations: {
                '70': { customer: { points_balance: 1200 } },
            },
        })

        const { result } = renderHook(() =>
            useIsIntegrationDisplayable(IntegrationType.Smile),
        )

        expect(result.current).toBe(true)
    })

    it('should return true when at least one of multiple integrations has displayable data', () => {
        mockSelectors({
            customerIntegrations: { '70': {}, '71': {} },
            integrations: [{ id: 70 }, { id: 71 }],
            widgetItems: [smileTicketWidget],
            sourceIntegrations: {
                '70': {},
                '71': { customer: { points_balance: 0 } },
            },
        })

        const { result } = renderHook(() =>
            useIsIntegrationDisplayable(IntegrationType.Smile),
        )

        expect(result.current).toBe(true)
    })
})

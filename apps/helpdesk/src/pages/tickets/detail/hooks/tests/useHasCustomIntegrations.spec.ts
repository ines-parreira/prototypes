import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import useAppSelector from 'hooks/useAppSelector'

import useHasCustomIntegrations from '../useHasCustomIntegrations'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

function mockState({
    widgets,
    sources,
}: {
    widgets: Record<string, unknown>[]
    sources?: Record<string, unknown>
}) {
    useAppSelectorMock
        .mockReturnValueOnce(fromJS(widgets))
        .mockReturnValueOnce(fromJS(sources ?? {}))
}

describe('useHasCustomIntegrations', () => {
    it('should return false when there are no widgets', () => {
        mockState({ widgets: [] })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return false when all widgets are named integration types', () => {
        mockState({
            widgets: [
                { type: 'shopify', context: 'ticket' },
                { type: 'recharge', context: 'ticket' },
                { type: 'bigcommerce', context: 'ticket' },
            ],
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return true when a custom widget has source data', () => {
        mockState({
            widgets: [{ type: 'custom', context: 'ticket' }],
            sources: {
                ticket: { customer: { custom: { someField: 'value' } } },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return true when a standalone widget exists', () => {
        mockState({
            widgets: [{ type: 'standalone', context: 'ticket' }],
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return true when a customer_external_data widget has matching app data', () => {
        mockState({
            widgets: [
                {
                    type: 'customer_external_data',
                    context: 'ticket',
                    app_id: 'my-app',
                },
            ],
            sources: {
                ticket: {
                    customer: {
                        external_data: {
                            'my-app': { data: 'value' },
                        },
                    },
                },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return false when a customer_external_data widget has no matching app data', () => {
        mockState({
            widgets: [
                {
                    type: 'customer_external_data',
                    context: 'ticket',
                    app_id: 'my-app',
                },
            ],
            sources: {
                ticket: {
                    customer: { customer_external_data: {} },
                },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return false when a custom widget type exists but has no source data', () => {
        mockState({
            widgets: [
                { type: 'shopify', context: 'ticket' },
                {
                    type: 'customer_external_data',
                    context: 'ticket',
                    app_id: 'my-app',
                },
            ],
            sources: {
                ticket: { customer: {} },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return true when there is a mix of named and displayable custom types', () => {
        mockState({
            widgets: [
                { type: 'shopify', context: 'ticket' },
                { type: 'woocommerce', context: 'ticket' },
                { type: 'standalone', context: 'ticket' },
                { type: 'recharge', context: 'ticket' },
            ],
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })

    it('should return false for each named integration type individually', () => {
        const namedTypes = [
            'shopify',
            'recharge',
            'woocommerce',
            'bigcommerce',
            'magento2',
            'yotpo',
            'smile',
        ]

        for (const type of namedTypes) {
            mockState({
                widgets: [{ type, context: 'ticket' }],
            })

            const { result } = renderHook(() => useHasCustomIntegrations())

            expect(result.current).toBe(false)
        }
    })

    it('should return false for an HTTP integration widget without source data', () => {
        mockState({
            widgets: [
                {
                    type: 'http',
                    context: 'ticket',
                    integration_id: '123',
                },
            ],
            sources: {
                ticket: { customer: { integrations: {} } },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(false)
    })

    it('should return true for an HTTP integration widget with source data', () => {
        mockState({
            widgets: [
                {
                    type: 'http',
                    context: 'ticket',
                    integration_id: '123',
                },
            ],
            sources: {
                ticket: {
                    customer: {
                        integrations: { '123': { data: 'value' } },
                    },
                },
            },
        })

        const { result } = renderHook(() => useHasCustomIntegrations())

        expect(result.current).toBe(true)
    })
})

import { fromJS } from 'immutable'
import type { Map } from 'immutable'

import {
    CUSTOM_WIDGET_TYPE,
    CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
} from 'state/widgets/constants'
import { WidgetEnvironment } from 'state/widgets/types'

import { getSourcePathFromContext, getWidgetSourcePath } from '../utils'

function widget(input: Record<string, unknown>) {
    return fromJS(input) as Map<string, unknown>
}

function sourcesAt(input: Record<string, unknown>) {
    return fromJS(input) as Map<string, unknown>
}

describe('getSourcePathFromContext()', () => {
    it('should render defaultSourcePath for ticket context because unknown context type', () => {
        const sourcePath = getSourcePathFromContext(
            'some_random_context' as WidgetEnvironment,
            '',
        )

        expect(sourcePath).toMatchSnapshot()
    })

    it('should render values of config because unknown widget type', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetEnvironment.Ticket,
            '',
        )

        expect(sourcePath).toMatchSnapshot()
    })

    it('should not append to the same array', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetEnvironment.Ticket,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
        ) as string[]

        sourcePath.push('1')

        const sourcePath2 = getSourcePathFromContext(
            WidgetEnvironment.Ticket,
            CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE,
        ) as string[]

        sourcePath2.push('2')

        expect(sourcePath.includes('2')).toBe(false)
        expect(sourcePath2.includes('1')).toBe(false)
    })

    it('should render the sourcePath for standalone widget because of wrong widget type', () => {
        const sourcePath = getSourcePathFromContext(
            WidgetEnvironment.Ticket,
            'abc_random_widget_type',
        )

        expect(sourcePath).toMatchSnapshot()
    })
    it.each([
        [WidgetEnvironment.Ticket, CUSTOM_WIDGET_TYPE],
        [WidgetEnvironment.Ticket, 'integrations'],
        [WidgetEnvironment.Ticket, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
        [WidgetEnvironment.Customer, CUSTOM_WIDGET_TYPE],
        [WidgetEnvironment.Customer, 'integrations'],
        [WidgetEnvironment.Customer, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
        [WidgetEnvironment.User, CUSTOM_WIDGET_TYPE],
        [WidgetEnvironment.User, 'integrations'],
        [WidgetEnvironment.User, CUSTOMER_EXTERNAL_DATA_WIDGET_TYPE],
    ])(
        'should render the correct sourcePath',
        (widgetContextType: WidgetEnvironment, widgetType: string) => {
            const sourcePath = getSourcePathFromContext(
                widgetContextType,
                widgetType,
            )

            expect(sourcePath).toMatchSnapshot(
                `getSourcePathFromContext() should render the correct sourcePath DEFAULT_SOURCE_PATHS[${widgetContextType}][${widgetType}]`,
            )
        },
    )
})

describe('getWidgetSourcePath()', () => {
    it('returns an empty path for standalone widgets regardless of source data', () => {
        const result = getWidgetSourcePath(
            widget({ type: 'standalone', context: 'ticket' }),
            sourcesAt({}),
        )

        expect(result).toEqual([])
    })

    it('returns the external_data path for customer_external_data widgets with a matching app_id', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'customer_external_data',
                context: 'ticket',
                app_id: 'my-app',
            }),
            sourcesAt({
                ticket: {
                    customer: {
                        external_data: { 'my-app': { foo: 'bar' } },
                    },
                },
            }),
        )

        expect(result).toEqual([
            'ticket',
            'customer',
            'external_data',
            'my-app',
        ])
    })

    it('returns null for customer_external_data widgets with an app_id that has no source data', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'customer_external_data',
                context: 'ticket',
                app_id: 'my-app',
            }),
            sourcesAt({
                ticket: { customer: { external_data: {} } },
            }),
        )

        expect(result).toBeNull()
    })

    it('falls back to integrations.<id> for customer_external_data widgets with no app_id (Stay.Ai shape)', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'customer_external_data',
                context: 'ticket',
                integration_id: 72644,
                app_id: null,
            }),
            sourcesAt({
                ticket: {
                    customer: {
                        integrations: { '72644': { customerName: 'A' } },
                    },
                },
            }),
        )

        expect(result).toEqual(['ticket', 'customer', 'integrations', '72644'])
    })

    it('returns null for customer_external_data widgets with no app_id and no integrations source data', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'customer_external_data',
                context: 'ticket',
                integration_id: 72644,
                app_id: null,
            }),
            sourcesAt({
                ticket: { customer: { integrations: {} } },
            }),
        )

        expect(result).toBeNull()
    })

    it('returns integrations.<id> for custom widgets bound to an integration with source data (SavedBy shape)', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'custom',
                context: 'ticket',
                integration_id: 70743,
                app_id: '6618319566be1309e32d99c2',
            }),
            sourcesAt({
                ticket: {
                    customer: {
                        integrations: { '70743': { order0: { name: '#1' } } },
                    },
                },
            }),
        )

        expect(result).toEqual(['ticket', 'customer', 'integrations', '70743'])
    })

    it('falls back to the custom data path for custom widgets when integrations source is missing', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'custom',
                context: 'ticket',
                integration_id: 70743,
            }),
            sourcesAt({
                ticket: { customer: { integrations: {} } },
            }),
        )

        expect(result).toEqual(['ticket', 'customer', 'data'])
    })

    it('returns the custom data path for custom widgets without an integration_id', () => {
        const result = getWidgetSourcePath(
            widget({ type: 'custom', context: 'ticket' }),
            sourcesAt({}),
        )

        expect(result).toEqual(['ticket', 'customer', 'data'])
    })

    it('prefers integrations.<id> over the custom data path when both have source data', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'custom',
                context: 'ticket',
                integration_id: 70743,
            }),
            sourcesAt({
                ticket: {
                    customer: {
                        data: { legacy: 'value' },
                        integrations: { '70743': { order0: { name: '#1' } } },
                    },
                },
            }),
        )

        expect(result).toEqual(['ticket', 'customer', 'integrations', '70743'])
    })

    it('returns integrations.<id> for HTTP-style widgets with source data', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'http',
                context: 'ticket',
                integration_id: 123,
            }),
            sourcesAt({
                ticket: {
                    customer: { integrations: { '123': { foo: 'bar' } } },
                },
            }),
        )

        expect(result).toEqual(['ticket', 'customer', 'integrations', '123'])
    })

    it('returns null for HTTP-style widgets without integrations source data', () => {
        const result = getWidgetSourcePath(
            widget({
                type: 'http',
                context: 'ticket',
                integration_id: 123,
            }),
            sourcesAt({
                ticket: { customer: { integrations: {} } },
            }),
        )

        expect(result).toBeNull()
    })

    it('returns null for unrecognized widgets without integration_id', () => {
        const result = getWidgetSourcePath(
            widget({ type: 'http', context: 'ticket' }),
            sourcesAt({}),
        )

        expect(result).toBeNull()
    })
})

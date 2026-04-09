import { assumeMock } from '@repo/testing'

import { HttpMethod } from 'models/api/types'
import type { MacroAction } from 'models/macroAction/types'
import { MacroActionType } from 'models/macroAction/types'
import { getActionTemplate } from 'utils'

import {
    formatValue,
    getActionTitle,
    getFallbackArgumentLabel,
    getFallbackSummaries,
    hasRenderableValue,
    isListDictEntry,
    isNamedEntry,
    isRecord,
} from '../AIAgentDraftMessageHelpdeskV2/TicketReplyActionHelpdeskV2/utils'

jest.mock('utils', () => ({
    getActionTemplate: jest.fn(),
}))

const getActionTemplateMock = assumeMock(getActionTemplate)

const asActionName = (name: string) => name as MacroAction['name']
type ActionTemplate = NonNullable<ReturnType<typeof getActionTemplate>>

function createTemplate(
    overrides: Partial<ActionTemplate> = {},
): ActionTemplate {
    return {
        execution: 'back' as ActionTemplate['execution'],
        name: asActionName('http'),
        title: 'HTTP hook',
        ...overrides,
    }
}

function createAction(
    overrides: Partial<MacroAction> = {},
    argumentsOverride: MacroAction['arguments'] = {},
): MacroAction {
    return {
        name: asActionName('http'),
        title: 'HTTP hook',
        type: MacroActionType.User,
        arguments: argumentsOverride,
        ...overrides,
    }
}

describe('TicketReplyActionHelpdeskV2 utils', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('detects renderable values and formats primitives', () => {
        expect(isRecord({ key: 'value' })).toBe(true)
        expect(isRecord([])).toBe(false)
        expect(isRecord(null)).toBe(false)
        expect(isListDictEntry({ key: 'X-Test', value: '1' })).toBe(true)
        expect(isListDictEntry({ value: '1' })).toBe(false)
        expect(isNamedEntry({ name: 'Jamie Rivera' })).toBe(true)
        expect(isNamedEntry({ id: 1 })).toBe(false)

        expect(hasRenderableValue(undefined)).toBe(false)
        expect(hasRenderableValue('   ')).toBe(false)
        expect(hasRenderableValue('ready')).toBe(true)
        expect(hasRenderableValue([])).toBe(false)
        expect(hasRenderableValue(['value'])).toBe(true)
        expect(hasRenderableValue({})).toBe(false)
        expect(hasRenderableValue({ id: 1 })).toBe(true)
        expect(hasRenderableValue(false)).toBe(true)

        expect(formatValue(true)).toBe('Enabled')
        expect(formatValue(false)).toBe('Disabled')
        expect(formatValue(42)).toBe('42')
    })

    it('prefers template titles and labels when available', () => {
        getActionTemplateMock.mockReturnValue(
            createTemplate({
                title: 'Webhook',
                arguments: {
                    callback_url: {
                        label: 'Callback URL',
                    },
                },
            }),
        )

        const action = createAction()

        expect(getActionTitle(action)).toBe('Webhook')
        expect(getFallbackArgumentLabel(action, 'callback_url')).toBe(
            'Callback URL',
        )
    })

    it('falls back to the action title and start-cased labels', () => {
        getActionTemplateMock.mockReturnValue(undefined)

        const action = createAction({
            title: 'External action',
        })

        expect(getActionTitle(action)).toBe('External action')
        expect(getFallbackArgumentLabel(action, 'custom_flag')).toBe(
            'Custom Flag',
        )
    })

    it('builds summaries for primitives, arrays, named entries, and records', () => {
        getActionTemplateMock.mockReturnValue(
            createTemplate({
                arguments: {
                    method: { label: 'Method' },
                    headers: { label: 'Headers' },
                    recipients: { label: 'Recipients' },
                    target: { label: 'Target' },
                    metadata: { label: 'Metadata' },
                    enabled: { label: 'Enabled' },
                },
            }),
        )

        const action = createAction({}, {
            method: HttpMethod.Post,
            attachments: [
                {
                    name: 'invoice.pdf',
                    url: 'https://example.com/invoice.pdf',
                },
            ],
            body_html: '<p>Hello</p>',
            body_text: 'Hello',
            headers: [
                {
                    key: 'X-Test',
                    value: '1',
                },
                {
                    foo: 'bar',
                },
            ],
            recipients: [
                {
                    name: 'Shipping team',
                },
            ],
            target: {
                name: 'Support',
            },
            metadata: {
                nested: true,
            },
            enabled: true,
        } as MacroAction['arguments'])

        expect(getFallbackSummaries(action)).toEqual([
            'Method: POST',
            'Headers: X-Test: 1',
            'Headers: {"foo":"bar"}',
            'Recipients: Shipping team',
            'Target: Support',
            'Metadata: {"nested":true}',
            'Enabled: Enabled',
        ])
    })

    it('skips empty values and falls back to start-cased labels for unsupported fields', () => {
        getActionTemplateMock.mockReturnValue(createTemplate())

        const action = createAction(
            {
                name: asActionName('customAction'),
            },
            {
                custom_flag: false,
                list_values: [null, '', { key: 'retry', value: 2 }],
                empty_array: [],
                empty_object: {},
                blank_string: '   ',
            } as MacroAction['arguments'],
        )

        expect(getFallbackSummaries(action)).toEqual([
            'Custom Flag: Disabled',
            'List Values: retry: 2',
        ])
    })
})

import { FIELD_DEFINITIONS } from '../../fieldDefinitions/fields'
import {
    FIELD_ID_TO_TEMPLATE_PATH,
    LEAF_TEMPLATE_DEFAULTS,
    preferencesToWidgetFields,
    sectionPreferencesToWidgets,
    TEMPLATE_PATH_TO_FIELD_ID,
    widgetFieldsToPreferences,
} from '../widgetFieldNormalization'

describe('widgetFieldNormalization', () => {
    describe('TEMPLATE_PATH_TO_FIELD_ID / FIELD_ID_TO_TEMPLATE_PATH', () => {
        it('has bidirectional mapping for all mapped fields', () => {
            for (const [path, id] of Object.entries(
                TEMPLATE_PATH_TO_FIELD_ID,
            )) {
                expect(FIELD_ID_TO_TEMPLATE_PATH[id]).toBe(path)
            }
        })

        it('maps all field definitions', () => {
            const mappedIds = new Set(Object.values(TEMPLATE_PATH_TO_FIELD_ID))
            for (const id of Object.keys(FIELD_DEFINITIONS)) {
                expect(mappedIds.has(id)).toBe(true)
            }
        })
    })

    describe('widgetFieldsToPreferences', () => {
        it('returns empty array when no widgets provided', () => {
            expect(widgetFieldsToPreferences(undefined, undefined)).toEqual([])
            expect(widgetFieldsToPreferences([], undefined)).toEqual([])
        })

        it('maps visible template fields to preferences in order', () => {
            const widgets = [
                { path: 'total_spent', type: 'text', title: 'Total spent' },
                { path: 'created_at', type: 'text', title: 'Created at' },
                { path: 'note', type: 'text', title: 'Note' },
            ]

            const result = widgetFieldsToPreferences(widgets, undefined)

            const visibleIds = result.filter((f) => f.visible).map((f) => f.id)
            expect(visibleIds).toEqual(['totalSpent', 'createdAt', 'note'])
        })

        it('marks fields not in template as hidden', () => {
            const widgets = [
                { path: 'total_spent', type: 'text', title: 'Total spent' },
            ]

            const result = widgetFieldsToPreferences(widgets, undefined)

            const hidden = result.filter((f) => !f.visible)
            expect(hidden.length).toBeGreaterThan(0)
            expect(hidden.find((f) => f.id === 'note')).toBeDefined()
        })

        it('skips unmapped template fields', () => {
            const widgets = [
                { path: 'addresses', type: 'array', title: 'Addresses' },
                { path: 'total_spent', type: 'text', title: 'Total spent' },
            ]

            const result = widgetFieldsToPreferences(widgets, undefined)

            expect(result.find((f) => f.id === 'addresses')).toBeUndefined()
            expect(result.find((f) => f.id === 'totalSpent')?.visible).toBe(
                true,
            )
        })

        it('uses FieldPreference[] directly when provided as array', () => {
            const widgets = [
                { path: 'total_spent', type: 'text', title: 'Total spent' },
            ]
            const fieldPreferences = [
                { id: 'totalSpent', visible: true },
                { id: 'note', visible: false },
            ]

            const result = widgetFieldsToPreferences(widgets, fieldPreferences)

            expect(result).toEqual(fieldPreferences)
        })

        it('filters out invalid field IDs from FieldPreference[] input', () => {
            const widgets = [
                { path: 'total_spent', type: 'text', title: 'Total spent' },
            ]
            const fieldPreferences = [
                { id: 'totalSpent', visible: true },
                { id: 'nonExistentField', visible: true },
                { id: 'note', visible: false },
            ]

            const result = widgetFieldsToPreferences(widgets, fieldPreferences)

            expect(result).toEqual([
                { id: 'totalSpent', visible: true },
                { id: 'note', visible: false },
            ])
        })
    })

    describe('preferencesToWidgetFields', () => {
        it('creates leaf templates for visible mapped fields', () => {
            const preferences = [
                { id: 'totalSpent', visible: true },
                { id: 'note', visible: true },
                { id: 'email', visible: false },
            ]

            const { widgets } = preferencesToWidgetFields(
                preferences,
                undefined,
            )

            expect(widgets).toHaveLength(2)
            expect(widgets[0].path).toBe('total_spent')
            expect(widgets[1].path).toBe('note')
        })

        it('reuses existing leaf templates when available', () => {
            const existingWidgets = [
                {
                    path: 'total_spent',
                    type: 'text',
                    title: 'Total spent',
                    customProp: 'keep-me',
                },
            ]

            const preferences = [{ id: 'totalSpent', visible: true }]

            const { widgets } = preferencesToWidgetFields(
                preferences,
                existingWidgets,
            )

            expect(widgets[0]).toEqual(existingWidgets[0])
        })

        it('creates templates from defaults when no existing widget', () => {
            const preferences = [{ id: 'email', visible: true }]

            const { widgets } = preferencesToWidgetFields(
                preferences,
                undefined,
            )

            expect(widgets[0]).toEqual({
                path: 'email',
                type: 'email',
                title: 'Email',
            })
        })

        it('preserves unmapped template fields but excludes section source paths', () => {
            const existingWidgets = [
                { path: 'addresses', type: 'array', title: 'Addresses' },
                { path: 'total_spent', type: 'text', title: 'Total spent' },
                {
                    path: 'email_marketing_consent',
                    type: 'text',
                    title: 'Email marketing consent',
                },
                {
                    path: 'some_custom_field',
                    type: 'text',
                    title: 'Custom',
                },
            ]

            const preferences = [{ id: 'totalSpent', visible: true }]

            const { widgets } = preferencesToWidgetFields(
                preferences,
                existingWidgets,
            )

            const paths = widgets.map((w) => w.path)
            expect(paths).toContain('total_spent')
            expect(paths).toContain('some_custom_field')
            expect(paths).not.toContain('addresses')
            expect(paths).not.toContain('email_marketing_consent')
        })

        it('returns the full preferences array as fieldPreferences', () => {
            const preferences = [{ id: 'totalSpent', visible: true }]

            const { fieldPreferences } = preferencesToWidgetFields(
                preferences,
                undefined,
            )

            expect(fieldPreferences).toEqual(preferences)
        })

        it('maintains preference order for visible fields', () => {
            const preferences = [
                { id: 'note', visible: true },
                { id: 'email', visible: true },
                { id: 'totalSpent', visible: true },
            ]

            const { widgets } = preferencesToWidgetFields(
                preferences,
                undefined,
            )

            const mappedPaths = widgets.filter(
                (w) => TEMPLATE_PATH_TO_FIELD_ID[w.path],
            )
            expect(mappedPaths.map((w) => w.path)).toEqual([
                'note',
                'email',
                'total_spent',
            ])
        })
    })

    describe('sectionPreferencesToWidgets', () => {
        it('returns empty array when no sections provided', () => {
            expect(sectionPreferencesToWidgets(undefined, undefined)).toEqual(
                [],
            )
        })

        it('skips customer section', () => {
            const result = sectionPreferencesToWidgets(
                {
                    customer: {
                        fields: [{ id: 'totalSpent', visible: true }],
                    },
                },
                undefined,
            )
            expect(result).toEqual([])
        })

        it('generates card widget for defaultAddress', () => {
            const result = sectionPreferencesToWidgets(
                {
                    defaultAddress: {
                        fields: [
                            { id: 'address1', visible: true },
                            { id: 'city', visible: true },
                            { id: 'company', visible: false },
                        ],
                    },
                },
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].path).toBe('default_address')
            expect(result[0].type).toBe('card')
            expect(result[0].widgets).toHaveLength(2)
            expect(result[0].widgets![0].path).toBe('address1')
            expect(result[0].widgets![1].path).toBe('city')
        })

        it('generates card widget for emailMarketingConsent', () => {
            const result = sectionPreferencesToWidgets(
                {
                    emailMarketingConsent: {
                        fields: [{ id: 'state', visible: true }],
                    },
                },
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].path).toBe('email_marketing_consent')
            expect(result[0].type).toBe('card')
            expect(result[0].widgets).toHaveLength(1)
            expect(result[0].widgets![0].path).toBe('state')
        })

        it('generates card widget for smsMarketingConsent', () => {
            const result = sectionPreferencesToWidgets(
                {
                    smsMarketingConsent: {
                        fields: [
                            { id: 'state', visible: true },
                            { id: 'optInLevel', visible: true },
                        ],
                    },
                },
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].path).toBe('sms_marketing_consent')
            expect(result[0].type).toBe('card')
            expect(result[0].widgets).toHaveLength(2)
        })

        it('generates list > card structure for addresses', () => {
            const result = sectionPreferencesToWidgets(
                {
                    addresses: {
                        fields: [{ id: 'address1', visible: true }],
                    },
                },
                undefined,
            )

            expect(result).toHaveLength(1)
            expect(result[0].path).toBe('addresses')
            expect(result[0].type).toBe('list')
            expect(result[0].widgets).toHaveLength(1)
            expect(result[0].widgets![0].type).toBe('card')
            expect(result[0].widgets![0].path).toBeUndefined()
            expect(result[0].widgets![0].widgets).toHaveLength(1)
            expect(result[0].widgets![0].widgets![0].path).toBe('address1')
        })

        it('skips sections with no visible fields', () => {
            const result = sectionPreferencesToWidgets(
                {
                    defaultAddress: {
                        fields: [
                            { id: 'address1', visible: false },
                            { id: 'city', visible: false },
                        ],
                    },
                },
                undefined,
            )

            expect(result).toEqual([])
        })
    })

    describe('LEAF_TEMPLATE_DEFAULTS', () => {
        it('has defaults for all mapped field IDs', () => {
            for (const id of Object.values(TEMPLATE_PATH_TO_FIELD_ID)) {
                expect(LEAF_TEMPLATE_DEFAULTS[id]).toBeDefined()
            }
        })
    })
})

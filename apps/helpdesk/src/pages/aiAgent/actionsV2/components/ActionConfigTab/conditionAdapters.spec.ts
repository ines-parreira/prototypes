import type { Condition } from 'pages/aiAgent/actionsV2/sidePanel/actionForm/ConditionBuilder/types'
import type { ConditionSchema } from 'pages/automate/workflows/models/conditions.types'
import type {
    WorkflowVariable,
    WorkflowVariableList,
} from 'pages/automate/workflows/models/variables.types'

import {
    buildFieldsFromVariables,
    conditionsTypeFromLogicOperator,
    legacyToV2Conditions,
    logicOperatorFromConditionsType,
    makeGetOperators,
    makeGetValueOptions,
    v2ToLegacyCondition,
} from './conditionAdapters'

const makeVariable = (
    overrides: Partial<WorkflowVariable> & { value: string },
): WorkflowVariable =>
    ({
        name: overrides.name ?? overrides.value,
        nodeType: 'http_request',
        type: 'string',
        ...overrides,
    }) as WorkflowVariable

describe('conditionAdapters', () => {
    describe('logicOperatorFromConditionsType', () => {
        it('maps "and" to "all"', () => {
            expect(logicOperatorFromConditionsType('and')).toBe('all')
        })

        it('maps "or" to "any"', () => {
            expect(logicOperatorFromConditionsType('or')).toBe('any')
        })

        it('maps null to "none"', () => {
            expect(logicOperatorFromConditionsType(null)).toBe('none')
        })
    })

    describe('conditionsTypeFromLogicOperator', () => {
        it('maps "all" to "and"', () => {
            expect(conditionsTypeFromLogicOperator('all')).toBe('and')
        })

        it('maps "any" to "or"', () => {
            expect(conditionsTypeFromLogicOperator('any')).toBe('or')
        })

        it('maps "none" to null', () => {
            expect(conditionsTypeFromLogicOperator('none')).toBeNull()
        })
    })

    describe('buildFieldsFromVariables', () => {
        it('produces a field per variable in a flat list with the "general" category', () => {
            const variables: WorkflowVariableList = [
                makeVariable({ value: 'name', type: 'string' }),
                makeVariable({ value: 'age', type: 'number' }),
            ]

            const { fields, categories } = buildFieldsFromVariables(variables)

            expect(fields).toEqual([
                {
                    id: 'name',
                    label: 'name',
                    type: 'string',
                    category: 'general',
                },
                {
                    id: 'age',
                    label: 'age',
                    type: 'number',
                    category: 'general',
                },
            ])
            expect(categories).toEqual([{ id: 'general', label: 'General' }])
        })

        it('flattens grouped variables and keeps the group name as the category', () => {
            const variables: WorkflowVariableList = [
                {
                    name: 'Order',
                    nodeType: 'order_selection',
                    variables: [
                        makeVariable({ value: 'order.id', type: 'string' }),
                        makeVariable({
                            value: 'order.total',
                            type: 'number',
                        }),
                    ],
                },
            ]

            const { fields, categories } = buildFieldsFromVariables(variables)

            expect(fields.map((f) => f.category)).toEqual(['Order', 'Order'])
            expect(categories).toEqual([{ id: 'Order', label: 'Order' }])
        })

        it('treats a string variable with options as an enum field', () => {
            const variables: WorkflowVariableList = [
                makeVariable({
                    value: 'status',
                    type: 'string',
                    options: [
                        { value: 'open', label: 'Open' },
                        { value: 'closed', label: 'Closed' },
                    ],
                } as Partial<WorkflowVariable> & { value: string }),
            ]

            const { fields, variableById } = buildFieldsFromVariables(variables)

            expect(fields[0]).toMatchObject({ id: 'status', type: 'enum' })
            expect(variableById.get('status')?.type).toBe('string')
        })

        it('falls back to "string" type for unsupported variable types', () => {
            const variables: WorkflowVariableList = [
                makeVariable({ value: 'arr', type: 'array' }),
            ]

            const { fields } = buildFieldsFromVariables(variables)

            expect(fields[0]).toMatchObject({ id: 'arr', type: 'string' })
        })
    })

    describe('makeGetOperators', () => {
        it('returns BOOLEAN operators for a boolean variable', () => {
            const variables: WorkflowVariableList = [
                makeVariable({ value: 'active', type: 'boolean' }),
            ]
            const { variableById } = buildFieldsFromVariables(variables)
            const getOperators = makeGetOperators(variableById)

            const ops = getOperators('active')

            expect(ops).toEqual([{ id: 'equals', label: 'Is' }])
        })

        it('returns NUMBER operators for a number variable', () => {
            const variables: WorkflowVariableList = [
                makeVariable({ value: 'count', type: 'number' }),
            ]
            const { variableById } = buildFieldsFromVariables(variables)
            const getOperators = makeGetOperators(variableById)

            expect(getOperators('count').length).toBeGreaterThan(0)
            expect(getOperators('count')[0]).toHaveProperty('id')
            expect(getOperators('count')[0]).toHaveProperty('label')
        })

        it('returns DATE operators for a date variable', () => {
            const variables: WorkflowVariableList = [
                makeVariable({ value: 'createdAt', type: 'date' }),
            ]
            const { variableById } = buildFieldsFromVariables(variables)
            const getOperators = makeGetOperators(variableById)

            expect(getOperators('createdAt').length).toBeGreaterThan(0)
        })

        it('falls back to STRING operators when the field is unknown', () => {
            const getOperators = makeGetOperators(new Map())
            const ops = getOperators('unknown')

            expect(ops.find((op) => op.id === 'equals')).toBeDefined()
            expect(ops.find((op) => op.id === 'contains')).toBeDefined()
        })
    })

    describe('makeGetValueOptions', () => {
        const variables: WorkflowVariableList = [
            makeVariable({ value: 'active', type: 'boolean' }),
            makeVariable({ value: 'createdAt', type: 'date' }),
            makeVariable({ value: 'count', type: 'number' }),
            makeVariable({
                value: 'status',
                type: 'string',
                options: [
                    { value: 'open', label: 'Open' },
                    { value: null, label: 'Unknown' },
                ],
            } as Partial<WorkflowVariable> & { value: string }),
        ]
        const { variableById } = buildFieldsFromVariables(variables)

        it('returns an empty array for existence operators', () => {
            const condition: Condition = {
                id: 'c1',
                field: 'count',
                operator: 'exists',
                value: '',
            }
            const getValueOptions = makeGetValueOptions(variableById)

            expect(getValueOptions(condition)).toEqual([])
        })

        it('returns interval options for interval operators', () => {
            const condition: Condition = {
                id: 'c1',
                field: 'createdAt',
                operator: 'lessThanInterval',
                value: '',
            }
            const getValueOptions = makeGetValueOptions(variableById)

            const opts = getValueOptions(condition)

            expect(opts).toEqual(
                expect.arrayContaining([
                    { value: '-1d', label: '1 day ago' },
                    { value: '-7d', label: '7 days ago' },
                ]),
            )
        })

        it('uses the current condition operator even when another condition with the same field exists', () => {
            const getValueOptions = makeGetValueOptions(variableById)
            const existsCondition: Condition = {
                id: 'c1',
                field: 'createdAt',
                operator: 'exists',
                value: '',
            }
            const intervalCondition: Condition = {
                id: 'c2',
                field: 'createdAt',
                operator: 'lessThanInterval',
                value: '',
            }

            expect(getValueOptions(existsCondition)).toEqual([])
            expect(getValueOptions(intervalCondition)?.length).toBeGreaterThan(
                0,
            )
        })

        it('returns true/false options for boolean variables', () => {
            const getValueOptions = makeGetValueOptions(variableById)
            const condition: Condition = {
                id: 'c1',
                field: 'active',
                operator: 'equals',
                value: '',
            }

            expect(getValueOptions(condition)).toEqual([
                { value: 'true', label: 'True' },
                { value: 'false', label: 'False' },
            ])
        })

        it('returns the variable options for enum-like string variables', () => {
            const getValueOptions = makeGetValueOptions(variableById)
            const condition: Condition = {
                id: 'c1',
                field: 'status',
                operator: 'equals',
                value: '',
            }

            expect(getValueOptions(condition)).toEqual([
                { value: 'open', label: 'Open' },
                { value: '', label: 'Unknown' },
            ])
        })

        it('returns undefined for free-text variables', () => {
            const getValueOptions = makeGetValueOptions(variableById)
            const condition: Condition = {
                id: 'c1',
                field: 'count',
                operator: 'equals',
                value: '',
            }

            expect(getValueOptions(condition)).toBeUndefined()
        })
    })

    describe('legacyToV2Conditions', () => {
        it('maps a value tuple to a stringified value', () => {
            const legacy = [
                {
                    equals: [{ var: 'name' }, 'Alice'],
                },
            ] as unknown as ConditionSchema[]

            const result = legacyToV2Conditions(legacy)

            expect(result).toEqual([
                expect.objectContaining({
                    field: 'name',
                    operator: 'equals',
                    value: 'Alice',
                }),
            ])
        })

        it('stringifies boolean values', () => {
            const legacy = [
                { equals: [{ var: 'active' }, true] },
                { equals: [{ var: 'active' }, false] },
            ] as unknown as ConditionSchema[]

            const result = legacyToV2Conditions(legacy)

            expect(result.map((c) => c.value)).toEqual(['true', 'false'])
        })

        it('emits an empty value for existence operators', () => {
            const legacy = [
                { exists: [{ var: 'name' }] },
            ] as unknown as ConditionSchema[]

            const [condition] = legacyToV2Conditions(legacy)

            expect(condition).toMatchObject({
                field: 'name',
                operator: 'exists',
                value: '',
            })
        })

        it('stringifies null/undefined values as empty strings', () => {
            const legacy = [
                { equals: [{ var: 'name' }, null] },
                { equals: [{ var: 'name' }, undefined] },
            ] as unknown as ConditionSchema[]

            const result = legacyToV2Conditions(legacy)

            expect(result.map((c) => c.value)).toEqual(['', ''])
        })

        it('generates a stable id derived from index, field and operator', () => {
            const legacy = [
                { equals: [{ var: 'name' }, 'Alice'] },
                { exists: [{ var: 'name' }] },
            ] as unknown as ConditionSchema[]

            const result = legacyToV2Conditions(legacy)

            expect(result[0].id).toBe('legacy-0-name-equals')
            expect(result[1].id).toBe('legacy-1-name-exists')
        })
    })

    describe('v2ToLegacyCondition', () => {
        const variables: WorkflowVariableList = [
            makeVariable({ value: 'name', type: 'string' }),
            makeVariable({ value: 'count', type: 'number' }),
            makeVariable({ value: 'active', type: 'boolean' }),
            makeVariable({ value: 'createdAt', type: 'date' }),
        ]
        const { variableById } = buildFieldsFromVariables(variables)

        it('emits just the var ref for existence operators', () => {
            const result = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'name',
                    operator: 'exists',
                    value: '',
                },
                variableById,
            )

            expect(result).toEqual({ exists: [{ var: 'name' }] })
        })

        it('parses boolean values from strings', () => {
            const trueResult = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'active',
                    operator: 'equals',
                    value: 'true',
                },
                variableById,
            )

            const falseResult = v2ToLegacyCondition(
                {
                    id: 'c2',
                    field: 'active',
                    operator: 'equals',
                    value: 'false',
                },
                variableById,
            )

            expect(trueResult).toEqual({
                equals: [{ var: 'active' }, true],
            })
            expect(falseResult).toEqual({
                equals: [{ var: 'active' }, false],
            })
        })

        it('emits undefined for boolean conditions that have not been chosen', () => {
            const result = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'active',
                    operator: 'equals',
                    value: '',
                },
                variableById,
            )

            expect(result).toEqual({
                equals: [{ var: 'active' }, undefined],
            })
        })

        it('parses numeric values and emits undefined for invalid input', () => {
            const validResult = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'count',
                    operator: 'equals',
                    value: '42',
                },
                variableById,
            )
            const emptyResult = v2ToLegacyCondition(
                { id: 'c2', field: 'count', operator: 'equals', value: '' },
                variableById,
            )
            const nanResult = v2ToLegacyCondition(
                {
                    id: 'c3',
                    field: 'count',
                    operator: 'equals',
                    value: 'not-a-number',
                },
                variableById,
            )

            expect(validResult).toEqual({
                equals: [{ var: 'count' }, 42],
            })
            expect(emptyResult).toEqual({
                equals: [{ var: 'count' }, undefined],
            })
            expect(nanResult).toEqual({
                equals: [{ var: 'count' }, undefined],
            })
        })

        it('passes through date values as strings and clears empty dates', () => {
            const dated = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'createdAt',
                    operator: 'lessThan',
                    value: '2026-01-01',
                },
                variableById,
            )
            const empty = v2ToLegacyCondition(
                {
                    id: 'c2',
                    field: 'createdAt',
                    operator: 'lessThan',
                    value: '',
                },
                variableById,
            )

            expect(dated).toEqual({
                lessThan: [{ var: 'createdAt' }, '2026-01-01'],
            })
            expect(empty).toEqual({
                lessThan: [{ var: 'createdAt' }, undefined],
            })
        })

        it('defaults interval operators to "-1d" when no value is provided', () => {
            const withValue = v2ToLegacyCondition(
                {
                    id: 'c1',
                    field: 'createdAt',
                    operator: 'lessThanInterval',
                    value: '-7d',
                },
                variableById,
            )
            const withoutValue = v2ToLegacyCondition(
                {
                    id: 'c2',
                    field: 'createdAt',
                    operator: 'lessThanInterval',
                    value: '',
                },
                variableById,
            )

            expect(withValue).toEqual({
                lessThanInterval: [{ var: 'createdAt' }, '-7d'],
            })
            expect(withoutValue).toEqual({
                lessThanInterval: [{ var: 'createdAt' }, '-1d'],
            })
        })

        it('emits undefined for empty string values on string fields', () => {
            const result = v2ToLegacyCondition(
                { id: 'c1', field: 'name', operator: 'equals', value: '' },
                variableById,
            )

            expect(result).toEqual({
                equals: [{ var: 'name' }, undefined],
            })
        })
    })
})

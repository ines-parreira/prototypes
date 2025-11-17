import type {
    ConditionSchema,
    VarSchema,
} from 'pages/automate/workflows/models/conditions.types'
import type { WorkflowVariable } from 'pages/automate/workflows/models/variables.types'

import { handleOperatorSelectLogic } from '../handleOperatorSelectLogic'

describe('handleOperatorSelectLogic', () => {
    const mockOnConditionChange = jest.fn()

    const baseVarSchema: VarSchema = { var: 'test.variable' }

    const createCondition = (key: string, value?: any): ConditionSchema =>
        ({ [key]: [baseVarSchema, value] }) as any

    const stringVariable: WorkflowVariable = {
        name: 'Test String',
        value: 'test.variable',
        nodeType: 'order_selection',
        type: 'string',
    }

    const dateVariable: WorkflowVariable = {
        name: 'Test String',
        value: 'test.variable',
        nodeType: 'order_selection',
        type: 'date',
    }

    const numberVariable: WorkflowVariable = {
        name: 'Test Number',
        value: 'test.variable',
        nodeType: 'order_selection',
        type: 'number',
    }

    const handleOperatorSelect =
        (
            onConditionChange: (
                condition: ConditionSchema,
                index: number,
            ) => void,
        ) =>
        (
            condition: ConditionSchema,
            index: number,
            variable: WorkflowVariable,
        ) =>
        (nextKey: string) => {
            const updated = handleOperatorSelectLogic(
                condition,
                nextKey as any,
                variable,
            )
            onConditionChange(updated, index)
        }

    beforeEach(() => {
        jest.clearAllMocks()
    })
    it('should copy the schema when no special conditions apply', () => {
        const condition = createCondition(
            'isNotEmpty',
            'test value',
        ) as ConditionSchema
        const expected = createCondition('contains', 'test value')
        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            stringVariable,
        )

        handler('contains')
        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })
    it('should set 0 as default value when switching from exists to equals for number', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = { equals: [baseVarSchema, 0] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('equals')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should set empty string as default value when switching from exists to string operators for string variables', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = { contains: [baseVarSchema, ''] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            stringVariable,
        )
        handler('contains')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should remove default value when switching from equals to exists', () => {
        const condition = createCondition('equals', 'test')
        const expected = { exists: [baseVarSchema] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            stringVariable,
        )
        handler('exists')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should preserve value for greaterThan → lessThan (number)', () => {
        const condition = createCondition('greaterThan', 42)
        const expected = createCondition('lessThan', 42)

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('lessThan')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should set default value when switching from equals to lessThan for numbers', () => {
        const condition = createCondition('equals', 42)
        const expected = createCondition('lessThan', 0)

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('lessThan')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should set default value when switching from contains to greaterThan for numbers', () => {
        const condition = createCondition('contains', 'some text')
        const expected = createCondition('greaterThan', 0)

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('greaterThan')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should assign default 0 for number on switching from exists to greaterThan', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = createCondition('greaterThan', 0)

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('greaterThan')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should assign default 0 for number on switching from exists to lessOrEqual', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = { lessOrEqual: [baseVarSchema, 0] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('lessOrEqual')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should assign default 0 for number on switching from exists to greaterOrEqual', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = { greaterOrEqual: [baseVarSchema, 0] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('greaterOrEqual')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should assign default 0 for number on switching from exists to lessThan', () => {
        const condition = { exists: [baseVarSchema] } as ConditionSchema
        const expected = { lessThan: [baseVarSchema, 0] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            numberVariable,
        )
        handler('lessThan')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should set default interval value (-1d) when switching from non-interval to lessThanInterval', () => {
        const condition = createCondition('equals', 'test value')
        const expected = { lessThanInterval: [baseVarSchema, '-1d'] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            dateVariable,
        )
        handler('lessThanInterval')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should set default interval value (-1d) when switching from non-interval to greaterThanInterval', () => {
        const condition = createCondition('contains', 'some text')
        const expected = { greaterThanInterval: [baseVarSchema, '-1d'] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            dateVariable,
        )
        handler('greaterThanInterval')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should preserve value when switching from lessThanInterval to greaterThanInterval', () => {
        const condition = {
            lessThanInterval: [baseVarSchema, '-5d'],
        } as ConditionSchema
        const expected = { greaterThanInterval: [baseVarSchema, '-5d'] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            dateVariable,
        )
        handler('greaterThanInterval')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })

    it('should preserve value when switching from greaterThanInterval to lessThanInterval', () => {
        const condition = {
            greaterThanInterval: [baseVarSchema, '-3d'],
        } as ConditionSchema
        const expected = { lessThanInterval: [baseVarSchema, '-3d'] }

        const handler = handleOperatorSelect(mockOnConditionChange)(
            condition,
            0,
            dateVariable,
        )
        handler('lessThanInterval')

        expect(mockOnConditionChange).toHaveBeenCalledWith(expected, 0)
    })
})

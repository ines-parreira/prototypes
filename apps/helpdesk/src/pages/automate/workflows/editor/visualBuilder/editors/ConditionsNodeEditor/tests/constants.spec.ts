import {
    BOOLEAN_CONDITION_OPERATORS,
    DATE_CONDITION_OPERATORS,
    getOperatorListByVariable,
    NUMBER_CONDITION_OPERATORS,
    STRING_CONDITION_OPERATORS,
} from '../constants'

describe('getOperatorListByVariable()', () => {
    it('should return dedicated operators for string variable with options', () => {
        expect(
            getOperatorListByVariable({
                name: 'Fulfillment status',
                value: 'objects.order.external_fulfillment_status',
                nodeType: 'order_selection',
                type: 'string',
                options: [
                    { value: null, label: 'unfulfilled' },
                    { value: 'partial', label: 'partially fulfilled' },
                    { value: 'fulfilled', label: 'fulfilled' },
                    { value: 'restocked', label: 'restocked' },
                ],
            }),
        ).toEqual([
            {
                key: 'equals',
                label: 'Is',
            },
            {
                key: 'notEqual',
                label: 'Is not',
            },
        ])
    })

    it('should return string operators', () => {
        expect(
            getOperatorListByVariable({
                name: '',
                value: '',
                nodeType: 'order_selection',
                type: 'string',
            }),
        ).toEqual(STRING_CONDITION_OPERATORS)
    })

    it('should return number operators', () => {
        expect(
            getOperatorListByVariable({
                name: '',
                value: '',
                nodeType: 'order_selection',
                type: 'number',
            }),
        ).toEqual(NUMBER_CONDITION_OPERATORS)
    })

    it('should return boolean operators', () => {
        expect(
            getOperatorListByVariable({
                name: '',
                value: '',
                nodeType: 'order_selection',
                type: 'boolean',
            }),
        ).toEqual(BOOLEAN_CONDITION_OPERATORS)
    })

    it('should return date operators', () => {
        expect(
            getOperatorListByVariable({
                name: '',
                value: '',
                nodeType: 'order_selection',
                type: 'date',
            }),
        ).toEqual(DATE_CONDITION_OPERATORS)
    })
})

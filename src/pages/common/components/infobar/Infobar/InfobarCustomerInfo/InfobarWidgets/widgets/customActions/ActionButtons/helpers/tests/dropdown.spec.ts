import {ContentType} from 'models/api/types'
import {Action} from '../../../types'
import {
    prepareDropdownValue,
    splitDropdownValue,
    getDropdownOptions,
} from '../dropdown'

describe('splitDropdownValue', () => {
    it('should return an empty array if value is undefined', () => {
        expect(splitDropdownValue()).toEqual([])
    })

    it('should return an empty array if value is empty', () => {
        expect(splitDropdownValue('')).toEqual([])
    })

    it('should return an array containing each item separated by a comma', () => {
        expect(splitDropdownValue('item1;item2')).toEqual(['item1', 'item2'])
    })

    it('should not return an additional item if it has last comma with nothing or space', () => {
        expect(splitDropdownValue('item1;item2;')).toEqual(['item1', 'item2'])
        expect(splitDropdownValue('item1;item2; ')).toEqual(['item1', 'item2'])
    })
})

describe('prepareDropdownValue', () => {
    it('should clear all dropdown values', () => {
        const action = {
            headers: [
                {
                    key: 'header1',
                    type: 'text',
                    value: 'value1',
                },
                {
                    key: 'header2',
                    type: 'dropdown',
                    value: 'value2;value2',
                },
            ],
            params: [
                {
                    key: 'param1',
                    type: 'text',
                    value: 'value1',
                },
                {
                    key: 'param2',
                    type: 'dropdown',
                    value: 'value2',
                },
            ],
            body: {
                [ContentType.Form]: [
                    {
                        key: 'param1',
                        type: 'dropdown',
                        value: 'value1',
                    },
                    {
                        key: 'param2',
                        type: 'text',
                        value: 'value2',
                    },
                ],
            },
        } as unknown as Action

        const expectedAction = {
            headers: [
                {
                    key: 'header1',
                    type: 'text',
                    value: 'value1',
                },
                {
                    key: 'header2',
                    type: 'dropdown',
                    value: '',
                },
            ],
            params: [
                {
                    key: 'param1',
                    type: 'text',
                    value: 'value1',
                },
                {
                    key: 'param2',
                    type: 'dropdown',
                    value: '',
                },
            ],
            body: {
                [ContentType.Form]: [
                    {
                        key: 'param1',
                        type: 'dropdown',
                        value: '',
                    },
                    {
                        key: 'param2',
                        type: 'text',
                        value: 'value2',
                    },
                ],
            },
        } as unknown as Action

        expect(prepareDropdownValue(action)).toEqual(expectedAction)
    })

    it("should pick the first dropdown value if it's mandatory", () => {
        const action = {
            body: {
                [ContentType.Form]: [
                    {
                        key: 'param1',
                        type: 'dropdown',
                        value: 'value1; value2',
                        mandatory: true,
                    },
                ],
            },
        } as unknown as Action

        const expectedAction = {
            body: {
                [ContentType.Form]: [
                    {
                        key: 'param1',
                        type: 'dropdown',
                        value: 'value1',
                        mandatory: true,
                    },
                ],
            },
        } as unknown as Action

        expect(prepareDropdownValue(action)).toEqual(expectedAction)
    })
})

describe('getDropdownOptions', () => {
    it('should return an empty array if the initial value is empty or undefined', () => {
        expect(getDropdownOptions(undefined, undefined)).toEqual([])
        expect(getDropdownOptions('', '')).toEqual([])
    })

    it('should return a matching array of options', () => {
        expect(getDropdownOptions(undefined, 'value1;value2')).toEqual([
            {label: 'value1', value: 'value1'},
            {label: 'value2', value: 'value2'},
        ])
    })

    it('should return a clear option if isNotRequired param is true and there is a currentValue', () => {
        expect(getDropdownOptions('value1', 'value1;value2', true)).toEqual([
            {label: ' - ', value: ''},
            {label: 'value1', value: 'value1'},
            {label: 'value2', value: 'value2'},
        ])

        expect(
            getDropdownOptions('value1', 'value1;value2', false)
        ).not.toEqual(expect.arrayContaining([{label: ' - ', value: ''}]))

        expect(getDropdownOptions('', 'value1;value2', true)).not.toEqual(
            expect.arrayContaining([{label: ' - ', value: ''}])
        )
    })
})

import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'
import MultiSelectAsyncField from './'

describe('MultiSelectAsyncField component', () => {
    it('empty items', () => {
        const component = shallow(
            <MultiSelectAsyncField
                input = {{
                    value: []
                }}
                loadOptions = {_noop}
            />
        )

        expect(component.children().at(0).find('> div').length).toEqual(0)
    })

    it('multiple items correct amount', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const component = shallow(
            <MultiSelectAsyncField
                input = {{
                    value: values
                }}
                loadOptions = {_noop}
            />
        )

        expect(component.children().at(0).find('> div').length).toEqual(2)
    })

    it('multiple items correct content', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const component = shallow(
            <MultiSelectAsyncField
                input = {{
                    value: values
                }}
                loadOptions = {_noop}
            />
        )

        component.children().at(0).find('> div').forEach((item, index) => {
            expect(item.find('> span').first()).toHaveText(values[index].label)
        })
    })
})

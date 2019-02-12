import React from 'react'
import {shallow} from 'enzyme'
import _noop from 'lodash/noop'

import {isEmail} from '../../../../../../../../utils'

import MultiSelectAsyncField from './'

describe('MultiSelectAsyncField component', () => {
    const minProps = {
        value: [],
        onChange: _noop,
        loadOptions: _noop,
        allowCreate: true,
        allowCreateConstraint: isEmail,
    }

    it('empty items', () => {
        const component = shallow(<MultiSelectAsyncField{...minProps} />)

        expect(component.children().first().find('div > div').length).toEqual(0)
    })

    it('multiple items correct amount', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const component = shallow(
            <MultiSelectAsyncField
                {...minProps}
                value={values}
            />
        )

        expect(component.children().first().find('div > div').length).toEqual(2)
    })

    it('multiple items correct content', () => {
        const values = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const component = shallow(
            <MultiSelectAsyncField
                {...minProps}
                value={values}
            />
        )

        component.children().first().find('div > div').forEach((item, index) => {
            expect(item.find('span').first()).toHaveText(values[index].label)
        })
    })

    it('search for recipients on change input', () => {
        const options = [{
            label: 'Michel',
        }, {
            label: 'Lucien',
        }]

        const loadOptions = jest.fn((_, callback) => callback(options))

        const component = shallow(
            <MultiSelectAsyncField
                {...minProps}
                loadOptions={loadOptions}
            />
        )

        component.children().first().find('div > input').simulate('change', {target: {value: 'Something'}})
        expect(loadOptions).toBeCalled()
        expect(component.state('options')).toEqual(options)
    })

    it('add recipients on change input with multiples addresses', () => {
        const onChange = jest.fn((values) => values)

        const component = shallow(
            <MultiSelectAsyncField
                {...minProps}
                value={[{value: 'existing@gorgias.io'}]}
                onChange={onChange}
            />
        )

        component.children().first().find('div > input').simulate('change', {
            preventDefault: _noop,
            stopPropagation: _noop,
            target: {
                value: 'alex@gorgias.io, Romain <romain@gorgias.io>, wrongaddress',
            },
        })
        expect(onChange).toBeCalledWith([
            {value: 'existing@gorgias.io'},
            {value: 'alex@gorgias.io'},
            {value: 'romain@gorgias.io', name: 'Romain'},
        ])
    })
})

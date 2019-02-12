import React from 'react'
import {mount} from 'enzyme'
import _noop from 'lodash/noop'

import MultiSelectField from '../MultiSelectField'
import MultiSelectOptionsField from '../MultiSelectOptionsField'

describe('MultiSelectField', () => {
    const options = [{
        value: 1,
        label: 'First',
    }, {
        value: 2,
        label: 'Second',
    }, {
        value: 3,
        label: 'Third',
    }]

    const props = {
        options,
        values: [1, 3],
        onChange: _noop,
        plural: 'tags',
        singular: 'tag',
        allowCustomValues: true,

    }

    it('should support custom selected values', () => {
        const component = mount(
            <MultiSelectField
                {...props}
                values={[1, 3, 'foo']}
            />
        )
        expect(component.find(MultiSelectOptionsField).prop('selectedOptions')).toEqual([
            options[0],
            options[2],
            {
                value: 'foo',
                label: 'foo'
            }
        ])
    })
})

import React, {ComponentProps} from 'react'
import {mount} from 'enzyme'
import _noop from 'lodash/noop'

import MultiSelectField from '../MultiSelectField'
import MultiSelectOptionsField from '../MultiSelectOptionsField/MultiSelectOptionsField'

describe('MultiSelectField', () => {
    const minProps: Pick<ComponentProps<typeof MultiSelectField>, 'options'> = {
        options: [
            {
                value: 1,
                label: 'First',
            },
            {
                value: 2,
                label: 'Second',
            },
            {
                value: 3,
                label: 'Third',
            },
        ],
    }

    const props: ComponentProps<typeof MultiSelectField> = {
        options: minProps.options,
        values: [1, 3],
        onChange: _noop,
        plural: 'tags',
        singular: 'tag',
        allowCustomValues: true,
    }

    it('should support custom selected values', () => {
        const component = mount(
            <MultiSelectField {...props} values={[1, 3, 'foo']} />
        )
        expect(
            component.find(MultiSelectOptionsField).prop('selectedOptions')
        ).toEqual([
            minProps.options[0],
            minProps.options[2],
            {
                value: 'foo',
                label: 'foo',
            },
        ])
    })

    it('should render the select field with no selected option', () => {
        const component = mount(<MultiSelectField {...props} values={null} />)
        expect(component).toMatchSnapshot()
    })
})

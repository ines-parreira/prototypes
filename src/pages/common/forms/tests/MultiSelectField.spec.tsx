import React, { ComponentProps } from 'react'

import { render, screen } from '@testing-library/react'
import _noop from 'lodash/noop'

import MultiSelectField from '../MultiSelectField'

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
        render(<MultiSelectField {...props} values={[1, 3, 'foo']} />)
        expect(screen.getByText('foo'))
    })

    it('should render the select field with no selected option', () => {
        const { container } = render(
            <MultiSelectField {...props} values={null} />,
        )
        expect(
            container.getElementsByClassName('container')[0].childNodes.length,
        ).toBe(1)
    })
})

import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'
import _noop from 'lodash/noop'
import _omit from 'lodash/omit'

import DEPRECATED_BooleanField from '../DEPRECATED_BooleanField'

describe('DEPRECATED_BooleanField', () => {
    const minProps: ComponentProps<typeof DEPRECATED_BooleanField> = {
        name: 'mybooleanfield',
        type: 'text',
        label: 'label',
        value: false,
        onChange: _noop,
        placeholder: 'placeholder',
    }

    it('should use default props', () => {
        const props = _omit(minProps, ['type'])

        const { container } = render(<DEPRECATED_BooleanField {...props} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a basic boolean input', () => {
        const { container } = render(<DEPRECATED_BooleanField {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a required input', () => {
        const { container } = render(
            <DEPRECATED_BooleanField {...minProps} required />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a help text', () => {
        const { container } = render(
            <DEPRECATED_BooleanField {...minProps} help="help text" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the input with an error', () => {
        const { container } = render(
            <DEPRECATED_BooleanField
                {...minProps}
                error="the value is wrong"
            />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render inline', () => {
        const { container } = render(
            <DEPRECATED_BooleanField {...minProps} inline />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

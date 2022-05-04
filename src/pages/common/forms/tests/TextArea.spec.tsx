import React from 'react'
import {render} from '@testing-library/react'

import TextArea from '../TextArea'

jest.mock('lodash/uniqueId', () => () => '42')

describe('TextArea', () => {
    const minProps = {
        className: 'class-for-wrapper',
        onChange: jest.fn(),
    }

    it('should render the textarea', () => {
        const {container} = render(<TextArea {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the textarea disabled', () => {
        const {container} = render(<TextArea {...minProps} isDisabled />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the textarea required', () => {
        const {container} = render(<TextArea {...minProps} isRequired />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the textarea with label', () => {
        const {container} = render(
            <TextArea {...minProps} label="Label of textarea" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the textarea with caption', () => {
        const {container} = render(
            <TextArea {...minProps} caption="More details..." />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the textarea with error', () => {
        const {container} = render(
            <TextArea {...minProps} error="This textarea is invalid" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

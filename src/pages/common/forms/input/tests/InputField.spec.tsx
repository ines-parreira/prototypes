import {render} from '@testing-library/react'
import React from 'react'

import InputField from '../InputField'

jest.mock('lodash/uniqueId', () => (id: string) => `${id}42`)

describe('<InputField />', () => {
    const defaultProps = {
        onChange: jest.fn(),
        value: '',
    }

    it('should render an input field', () => {
        const {container} = render(
            <InputField className="inputFieldClassName" {...defaultProps} />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a label', () => {
        const {container} = render(
            <InputField {...defaultProps} label="Label" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a caption', () => {
        const {container} = render(
            <InputField {...defaultProps} caption="Caption" />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

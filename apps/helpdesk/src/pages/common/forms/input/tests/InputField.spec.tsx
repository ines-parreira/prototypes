import React from 'react'

import { render } from '@repo/testing'

import { DefaultExportInputField as InputField } from '../InputField'

jest.mock('@gorgias/toolkit', () => ({
    ...jest.requireActual('@gorgias/toolkit'),
    uniqueId: () => '42',
}))
jest.mock('@gorgias/toolkit-react', () => ({
    ...jest.requireActual('@gorgias/toolkit-react'),
    useId: jest.fn(() => require('@gorgias/toolkit').uniqueId()),
}))

describe('<InputField />', () => {
    const defaultProps = {
        onChange: jest.fn(),
        value: '',
    }

    it('should render an input field', () => {
        const { container } = render(
            <InputField className="inputFieldClassName" {...defaultProps} />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a label', () => {
        const { container } = render(
            <InputField {...defaultProps} label="Label" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should display a caption', () => {
        const { container } = render(
            <InputField {...defaultProps} caption="Caption" />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

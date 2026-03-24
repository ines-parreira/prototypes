import React from 'react'

import { render } from '@testing-library/react'

import ProvinceInput from '../ProvinceInput'

jest.mock('@repo/logging')

describe('<ProvinceInput/>', () => {
    const onChange: jest.MockedFunction<(value: string) => void> = jest.fn()

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render with dropdown', () => {
        const { container } = render(
            <ProvinceInput
                label="State or province"
                onChange={onChange}
                country="United States"
                name="stateOrProvince"
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with text input', () => {
        const { container } = render(
            <ProvinceInput
                label="State or province"
                onChange={onChange}
                country="France"
                name="stateOrProvince"
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

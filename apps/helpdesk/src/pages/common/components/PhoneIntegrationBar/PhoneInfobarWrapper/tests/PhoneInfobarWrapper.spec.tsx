import React from 'react'

import { FeatureFlagKey, useFlag } from '@repo/feature-flags'
import { render } from '@testing-library/react'

import PhoneInfobarWrapper from '../PhoneInfobarWrapper'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

describe('<PhoneInfobarWrapper/>', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(true)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
    it('should render', () => {
        const { container } = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render as primary', () => {
        const { container } = render(
            <PhoneInfobarWrapper primary>Foo...</PhoneInfobarWrapper>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render with current infobar size', () => {
        window.localStorage.setItem('panel-sizes', '{"infobar":500}')

        const { container } = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply legacy class with restyling FF OFF', () => {
        mockUseFlag.mockImplementation((flagKey) => {
            if (flagKey === FeatureFlagKey.CallBarRestyling) {
                return false
            }
            return false
        })

        const { container } = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>,
        )

        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).toHaveClass('legacy')
    })

    it('should not apply legacy class when restyling FF is ON', () => {
        mockUseFlag.mockReturnValue(true)

        const { container } = render(
            <PhoneInfobarWrapper>Foo...</PhoneInfobarWrapper>,
        )

        const wrapper = container.firstChild as HTMLElement
        expect(wrapper).not.toHaveClass('legacy')
    })
})

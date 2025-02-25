import React from 'react'

import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'

import { FeatureFlagKey } from 'config/featureFlags'
import { useFlag } from 'core/flags'
import { THEME_NAME, useTheme } from 'core/theme'
import { getEnoughContrastedColor } from 'utils/colors'

import TicketTag from '../TicketTag'

jest.mock('core/flags', () => ({
    useFlag: jest.fn(),
}))
const mockUseFlag = useFlag as jest.Mock

const mockFlagSet = {
    [FeatureFlagKey.TagNewDesign]: false,
}

jest.mock('core/theme/useTheme.ts', () => jest.fn())
const useThemeMock = useTheme as jest.Mock

jest.mock('utils/launchDarkly')

jest.mock(
    'utils/colors',
    () =>
        ({
            ...jest.requireActual('utils/colors'),
            getEnoughContrastedColor: jest.fn(),
        }) as Record<string, any>,
)

describe('<TicketTag />', () => {
    beforeEach(() => {
        mockUseFlag.mockImplementation(
            (featureFlag: keyof typeof mockFlagSet) => {
                return mockFlagSet[featureFlag]
            },
        )

        useThemeMock.mockReturnValue({
            name: THEME_NAME.Classic,
            resolvedName: THEME_NAME.Classic,
        })
    })

    it('should render the tag', () => {
        const text = 'shipping'
        const color = '#123456' // hsl(210, 65%, 20%)

        const { container } = render(
            <TicketTag text={text} decoration={fromJS({ color })} />,
        )
        const tag = screen.getByText(text)

        expect(tag).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({
            color,
        })
        expect(container.firstChild).toHaveStyle({
            backgroundColor: 'hsl(210, 65%, 97%)',
        })
    })

    it('should render the tag for dark theme', () => {
        ;(
            getEnoughContrastedColor as jest.MockedFunction<
                typeof getEnoughContrastedColor
            >
        ).mockReturnValue('#123456')

        useThemeMock.mockReturnValue({
            name: THEME_NAME.Dark,
            resolvedName: THEME_NAME.Dark,
        })

        const label = 'shipping'
        const color = '#123456'

        const { container } = render(
            <TicketTag text={label} decoration={fromJS({ color })} />,
        )

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(container.firstChild).toHaveStyle({
            color: '#123456',
        })
        expect(container.firstChild).toHaveStyle({
            backgroundColor: 'hsl(210, 65%, 10%)',
        })
    })

    it('should let color choice be handled by Tag when tag color is invalid', () => {
        const label = 'shipping'
        const color = '#'

        const { container } = render(
            <TicketTag text={label} decoration={fromJS({ color })} />,
        )

        expect(container.firstChild).not.toHaveAttribute('style')
        expect(container.firstChild).toHaveClass('black')
    })

    it('should use new design', () => {
        mockUseFlag.mockReturnValue(true)
        const text = 'shipping'
        const color = '#123456'

        const { container } = render(
            <TicketTag text={text} decoration={fromJS({ color })} />,
        )

        expect(container.firstChild).not.toHaveAttribute('style')
        expect(screen.getByText(text)).toHaveStyle(`--tag-dot-color: ${color}`)
    })
})

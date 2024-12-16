import {render, screen} from '@testing-library/react'
import React from 'react'

import useGetBadgeTiers, {
    BadgeTiers,
} from 'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'

import {BadgeWithTiers} from '../BadgeWithTiers'

jest.mock(
    'pages/automate/aiAgent/insights/IntentTableWidget/BadgeWithTiers/hooks/useGetBadgeTiers'
)

const mockedUseGetBadgeTiers = jest.mocked(useGetBadgeTiers)

describe('BadgeWithTiers Component', () => {
    const mockTiers: BadgeTiers[] = [
        {range: [0, 10], background: '#FDF6FF', color: '#800080'},
        {range: [11, 20], background: '#FFD700', color: '#FFA500'},
        {range: [21, 30], background: '#90EE90', color: '#008000'},
    ]

    beforeEach(() => {
        mockedUseGetBadgeTiers.mockReturnValue(mockTiers)
    })

    test('renders with correct formatted value and styles for the tier', () => {
        render(
            <BadgeWithTiers
                values={[5, 15, 25]}
                value={12}
                formattedValue="12%"
            />
        )

        const badge = screen.getByText('+12%')
        expect(badge).toBeInTheDocument()

        const container = badge.parentElement
        expect(container).toHaveStyle({
            color: '#FFA500',
            backgroundColor: '#FFD700',
        })
    })

    test('renders with correct tier when value is on the edge of a range', () => {
        render(
            <BadgeWithTiers
                values={[5, 15, 25]}
                value={10}
                formattedValue="10%"
            />
        )

        const badge = screen.getByText('+10%')
        expect(badge).toBeInTheDocument()

        const container = badge.parentElement
        expect(container).toHaveStyle({
            color: '#800080',
            backgroundColor: '#FDF6FF',
        })
    })

    test('renders with default styles when no matching tier is found', () => {
        render(
            <BadgeWithTiers
                values={[5, 15, 25]}
                value={50}
                formattedValue="50%"
            />
        )

        const badge = screen.getByText('+50%')
        expect(badge).toBeInTheDocument()

        const container = badge.parentElement
        expect(container).toHaveStyle({
            color: undefined,
            backgroundColor: undefined,
        })
    })

    test('calls useGetBadgeTiers with the correct values', () => {
        render(
            <BadgeWithTiers values={[1, 2, 3]} value={2} formattedValue="2%" />
        )

        expect(useGetBadgeTiers).toHaveBeenCalledWith([1, 2, 3])
    })
})

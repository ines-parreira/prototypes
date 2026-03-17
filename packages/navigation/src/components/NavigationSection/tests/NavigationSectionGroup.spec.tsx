import { render, screen } from '@testing-library/react'

import { NavigationSectionGroup } from '../NavigationSectionGroup'

vi.mock('@repo/hooks', () => ({
    useLocalStorage: vi.fn((key: string, defaultValue: unknown) => [
        defaultValue,
        vi.fn(),
    ]),
}))

describe('NavigationSectionGroup', () => {
    it('renders children', () => {
        render(
            <NavigationSectionGroup storageKey="test">
                <div>Section One</div>
                <div>Section Two</div>
            </NavigationSectionGroup>,
        )

        expect(screen.getByText('Section One')).toBeInTheDocument()
        expect(screen.getByText('Section Two')).toBeInTheDocument()
    })

    it('uses the storageKey to namespace the localStorage key', async () => {
        const { useLocalStorage } = await import('@repo/hooks')

        render(
            <NavigationSectionGroup storageKey="analytics">
                <div>Child</div>
            </NavigationSectionGroup>,
        )

        expect(useLocalStorage).toHaveBeenCalledWith(
            'analytics:expanded-sections',
            expect.anything(),
        )
    })
})

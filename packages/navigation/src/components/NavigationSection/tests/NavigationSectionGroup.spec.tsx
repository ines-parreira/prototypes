import { render, screen } from '@testing-library/react'

import { NavigationSectionGroup } from '../NavigationSectionGroup'

describe('NavigationSectionGroup', () => {
    it('renders children', () => {
        render(
            <NavigationSectionGroup
                expandedKeys={[]}
                onExpandedChange={vi.fn()}
            >
                <div>Section One</div>
                <div>Section Two</div>
            </NavigationSectionGroup>,
        )

        expect(screen.getByText('Section One')).toBeInTheDocument()
        expect(screen.getByText('Section Two')).toBeInTheDocument()
    })
})

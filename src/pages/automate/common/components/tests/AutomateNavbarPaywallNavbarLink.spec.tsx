import React from 'react'
import {render, screen} from '@testing-library/react'
import {BrowserRouter as Router} from 'react-router-dom'
import AutomateNavbarPaywallNavbarLink from '../AutomateNavbarPaywallNavbarLink'

describe('AutomateNavbarPaywallNavbarLink', () => {
    test('renders children correctly', () => {
        render(
            <Router>
                <AutomateNavbarPaywallNavbarLink to="/test">
                    Test Link
                </AutomateNavbarPaywallNavbarLink>
            </Router>
        )
        expect(screen.getByText('Test Link')).toBeInTheDocument()
    })

    test('applies nested class when isNested is true', () => {
        render(
            <Router>
                <AutomateNavbarPaywallNavbarLink to="/test" isNested>
                    Test Link
                </AutomateNavbarPaywallNavbarLink>
            </Router>
        )

        expect(screen.getByRole('link').closest('div')).toHaveClass('isNested')
    })
})

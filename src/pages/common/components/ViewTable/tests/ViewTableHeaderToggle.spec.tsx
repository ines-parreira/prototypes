import {render} from '@testing-library/react'
import React from 'react'

import {MemoryRouter} from 'react-router-dom'

import * as useShowGlobalNavFeatureFlag from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'

import {ViewTableHeaderToggle} from '../ViewTableHeaderToggle'

// Mock the feature flag hook
jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag')
// Mock the Toggle component
jest.mock('split-ticket-view-toggle/components/Toggle', () => ({
    __esModule: true,
    default: () => <div data-testid="toggle-component" />,
}))

describe('ViewTableHeaderToggle', () => {
    const mockUseFeatureFlag =
        useShowGlobalNavFeatureFlag.useDesktopOnlyShowGlobalNavFeatureFlag as jest.Mock

    it('renders Toggle when feature flag is true', () => {
        mockUseFeatureFlag.mockReturnValue(true)

        const {getByTestId} = render(
            <MemoryRouter initialEntries={['/app/tickets/123']}>
                <ViewTableHeaderToggle />
            </MemoryRouter>
        )

        expect(getByTestId('toggle-component')).toBeInTheDocument()
    })

    it('renders null when feature flag is false', () => {
        mockUseFeatureFlag.mockReturnValue(false)

        const {container} = render(
            <MemoryRouter initialEntries={['/app/tickets/123']}>
                <ViewTableHeaderToggle />
            </MemoryRouter>
        )

        expect(container.firstChild).toBeNull()
    })
})

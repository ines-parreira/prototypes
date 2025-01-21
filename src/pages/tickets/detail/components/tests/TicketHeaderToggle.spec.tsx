import {render} from '@testing-library/react'
import React from 'react'
import {MemoryRouter, Route, Switch} from 'react-router-dom'

import * as useShowGlobalNavFeatureFlag from 'common/navigation/hooks/useShowGlobalNavFeatureFlag'

import {TicketHeaderToggle} from '../TicketHeaderToggle'

jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag')

jest.mock('split-ticket-view-toggle/components/Toggle', () => ({
    __esModule: true,
    default: () => <div data-testid="toggle-component" />,
}))

describe('TicketHeaderToggle', () => {
    const mockUseFeatureFlag =
        useShowGlobalNavFeatureFlag.useDesktopOnlyShowGlobalNavFeatureFlag as jest.Mock

    const renderWithRouter = (initialPath: string) => {
        return render(
            <MemoryRouter initialEntries={[initialPath]}>
                <Switch>
                    <Route path="/views/:viewId/:ticketId">
                        <TicketHeaderToggle />
                    </Route>
                    <Route path="/ticket/:ticketId">
                        <TicketHeaderToggle />
                    </Route>
                </Switch>
            </MemoryRouter>
        )
    }

    it('renders Toggle when feature flag is true and not in split view', () => {
        mockUseFeatureFlag.mockReturnValue(true)

        const {getByTestId} = renderWithRouter('/ticket/123')

        expect(getByTestId('toggle-component')).toBeInTheDocument()
    })

    it('renders null when feature flag is false', () => {
        mockUseFeatureFlag.mockReturnValue(false)

        const {container} = renderWithRouter('/ticket/123')

        expect(container.firstChild).toBeNull()
    })

    it('renders null when in split view, even if feature flag is true', () => {
        mockUseFeatureFlag.mockReturnValue(true)

        const {container} = renderWithRouter('/views/123/456')

        expect(container.firstChild).toBeNull()
    })
})

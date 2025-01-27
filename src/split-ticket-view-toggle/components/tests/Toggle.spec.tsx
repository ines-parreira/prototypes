import {render, screen} from '@testing-library/react'
import React from 'react'

import {Provider} from 'react-redux'
import {MemoryRouter} from 'react-router-dom'

import {store} from 'common/store'
import {SplitTicketViewProvider} from 'split-ticket-view-toggle'

import Toggle from '../Toggle'

// Mock the dependencies
jest.mock('common/segment')
jest.mock('common/navigation/hooks/useShowGlobalNavFeatureFlag', () => ({
    useDesktopOnlyShowGlobalNavFeatureFlag: jest.fn(() => true),
}))

describe('Toggle', () => {
    const renderWithProvider = (component: React.ReactNode) => {
        return render(
            <MemoryRouter>
                <Provider store={store}>
                    <SplitTicketViewProvider>
                        {component}
                    </SplitTicketViewProvider>
                </Provider>
            </MemoryRouter>
        )
    }

    it('should render the component', () => {
        renderWithProvider(<Toggle />)

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
    })
})

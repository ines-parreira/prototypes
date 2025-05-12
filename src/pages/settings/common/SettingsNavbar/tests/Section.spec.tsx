import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'

import { Navigation } from 'components/Navigation/Navigation'
import { UserRole } from 'config/types/user'

import Section from '../Section'

const mockStore = configureStore([])

describe('Section', () => {
    const mockCurrentUser = fromJS({
        has_password: true,
        role: { name: 'admin' },
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('render section', () => {
        const store = mockStore({
            currentUser: mockCurrentUser,
        })
        const value = 'Productivity'
        render(
            <Provider store={store}>
                <Navigation.Root>
                    <Section id="productivity" value={value}>
                        <div>Test</div>
                    </Section>
                </Navigation.Root>
            </Provider>,
        )

        expect(screen.getByText('Test')).toBeInTheDocument()
        expect(screen.getByText(value)).toBeInTheDocument()
    })

    it('does not render section if user does not have required role', async () => {
        const store = mockStore({
            currentUser: fromJS({}),
        })
        const value = 'Productivity'
        render(
            <Provider store={store}>
                <Navigation.Root>
                    <Section
                        id="productivity"
                        value={value}
                        requiredRole={UserRole.Agent}
                    >
                        <div>Test</div>
                    </Section>
                </Navigation.Root>
            </Provider>,
        )

        expect(screen.queryByText('Test')).not.toBeInTheDocument()
        expect(screen.queryByText(value)).not.toBeInTheDocument()
    })
})

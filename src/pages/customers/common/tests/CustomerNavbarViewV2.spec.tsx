import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { ViewType } from 'models/view/types'

// Mock the CSS modules
jest.mock('../components/CustomersNavbarViewV2.less', () => ({}))
jest.mock('pages/common/components/ViewCount/ViewCount.less', () => ({}))
jest.mock('pages/common/components/ViewName/ViewName.less', () => ({}))
jest.mock('components/Navigation/Navigation.less', () => ({}))

const mockStore = configureStore([])

describe('CustomersNavbarViewV2', () => {
    let store: ReturnType<typeof mockStore>
    const viewType = ViewType.CustomerList // Use CustomerList
    const settingType = 'customerViewPreferences' // Update setting type

    const mockViews = fromJS([
        { id: 'view-1', name: 'View One', slug: 'view-one' },
        { id: 'view-2', name: 'View Two', slug: 'view-two' },
    ])

    const mockGetViewCount = (viewId: string) => {
        if (viewId === 'view-1') return 5
        if (viewId === 'view-2') return 10
        return 0
    }

    beforeEach(() => {
        store = mockStore({
            // Mock relevant parts of the state if selectors needed it directly
            // For now, mocking the selector result is handled by mocking connect
        })

        // Mock the selectors used by connect
        jest.mock('state/views/selectors', () => ({
            makeGetViewsByType: () => () => mockViews,
            makeGetViewCount: () => mockGetViewCount,
        }))
    })

    const renderComponent = (isLoading = false) => {
        // Must import *after* mocks are set up
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {
            CustomersNavbarViewV2: ComponentToTest,
        } = require('../components/CustomersNavbarViewV2')

        return render(
            <Provider store={store}>
                <MemoryRouter>
                    <ComponentToTest
                        viewType={viewType}
                        settingType={settingType}
                        isLoading={isLoading}
                    />
                </MemoryRouter>
            </Provider>,
        )
    }

    it('should render the "Views" section trigger', () => {
        renderComponent()
        expect(screen.getByText('Views')).toBeInTheDocument()
    })

    it('should render view items with names and counts', () => {
        renderComponent()
        expect(screen.getByText('View One')).toBeInTheDocument()
        expect(screen.getByText('5')).toBeInTheDocument() // Count for View One
        expect(screen.getByText('View Two')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument() // Count for View Two
    })
})

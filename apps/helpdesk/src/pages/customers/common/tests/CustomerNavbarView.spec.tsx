import { setViewsCount } from '@repo/views'
import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import configureStore from 'redux-mock-store'

import { ViewType } from 'models/view/types'

const mockStore = configureStore([])

describe('CustomersNavbarView', () => {
    let store: ReturnType<typeof mockStore>
    const viewType = ViewType.CustomerList
    const settingType = 'customerViewPreferences'

    const mockViews = fromJS([
        { id: 1, name: 'View One', slug: 'view-one' },
        { id: 2, name: 'View Two', slug: 'view-two' },
    ])

    beforeEach(() => {
        store = mockStore({})

        setViewsCount({
            1: 5,
            2: 10,
        })

        jest.mock('state/views/selectors', () => ({
            makeGetViewsByType: () => () => mockViews,
        }))
    })

    const renderComponent = (isLoading = false) => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const {
            CustomersNavbarView: ComponentToTest,
        } = require('../components/CustomersNavbarView')

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
        expect(screen.getByText('5')).toBeInTheDocument()
        expect(screen.getByText('View Two')).toBeInTheDocument()
        expect(screen.getByText('10')).toBeInTheDocument()
    })
})

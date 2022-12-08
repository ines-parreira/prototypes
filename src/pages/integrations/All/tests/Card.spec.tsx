import React from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

import {IntegrationType} from 'models/integration/constants'
import {Category} from 'models/integration/types/app'
import {dummyAppListItem} from 'fixtures/apps'

import Card, {Pills, FEATURED_TEST_ID, LOADING_TEST_ID} from '../Card'

describe('<Pills />', () => {
    it('should render an empty div', () => {
        const {container} = render(<Pills item={{...dummyAppListItem}} />)
        expect(container.firstChild?.firstChild).toBeNull()
    })
    it('should render the upgrade button', () => {
        render(
            <Pills
                item={{...dummyAppListItem, requiredPriceName: 'enterprise'}}
            />
        )
        expect(screen.getByText('Upgrade'))
    })

    it('should render the checkmark icon', () => {
        render(<Pills item={{...dummyAppListItem, isConnected: true}} />)
        expect(screen.getByText('done'))
    })

    it('should render the number of install', () => {
        render(
            <Pills
                item={{
                    ...dummyAppListItem,
                    count: 2,
                    type: IntegrationType.BigCommerce,
                }}
            />
        )
        expect(screen.getByText('2'))
    })
    it('should render with a "Featured" label', () => {
        render(<Pills item={dummyAppListItem} isFeatured />)
        expect(screen.getByText('Featured'))
    })
})

describe('<Card />', () => {
    it('should render a basic link card with proper link', () => {
        const {container} = render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                        count: 1,
                        type: IntegrationType.BigCommerce,
                    }}
                />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render div card', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                        requiredPriceName: 'enterprise',
                    }}
                />
            </Provider>
        )
        expect(screen.queryByRole('link')).toBeNull()
    })

    it('should render a featured card with a featured pill', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                    }}
                    isFeatured
                />
            </Provider>
        )
        expect(screen.getByTestId(FEATURED_TEST_ID))
        expect(screen.getByText('Featured'))
    })

    it('should render a featured card without a featured pill', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                        categories: [Category.FEATURED],
                    }}
                    isFeatured
                    hasNoFeaturedPill
                />
            </Provider>
        )
        expect(screen.getByTestId(FEATURED_TEST_ID))
        expect(screen.queryByText('Featured')).toBeNull()
    })

    it('should render a loading card', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                    }}
                    isLoading
                />
            </Provider>
        )
        expect(screen.queryByRole('link')).toBeNull()
        expect(screen.getByTestId(LOADING_TEST_ID))
    })
})

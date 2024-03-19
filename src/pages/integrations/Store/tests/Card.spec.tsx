import React from 'react'
import {render, screen} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

import {IntegrationType} from 'models/integration/constants'
import {Category} from 'models/integration/types/app'
import {dummyAppListIntegrationItem} from 'fixtures/apps'

import Card, {Pills, CARD_LINK_TEST_ID, LOADING_TEST_ID} from '../Card'

describe('<Pills />', () => {
    it('should render an empty div', () => {
        const {container} = render(
            <Pills item={{...dummyAppListIntegrationItem, count: 0}} />
        )
        expect(container.firstChild?.firstChild).toBeNull()
    })
    it('should render the upgrade button', () => {
        render(
            <Pills
                item={{
                    ...dummyAppListIntegrationItem,
                    requiredPriceName: 'enterprise',
                }}
            />
        )
        expect(screen.getByText('Upgrade'))
    })

    it('should render the number of install', () => {
        render(
            <Pills
                item={{
                    ...dummyAppListIntegrationItem,
                    count: 2,
                    type: IntegrationType.BigCommerce,
                }}
            />
        )
        expect(screen.getByText('2'))
    })
    it('should render with a "Featured" label', () => {
        render(<Pills item={dummyAppListIntegrationItem} isFeatured />)
        expect(screen.getByText('Featured'))
    })
})

describe('<Card />', () => {
    it('should render a basic link card with proper link', () => {
        const {container} = render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
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
                        ...dummyAppListIntegrationItem,
                        requiredPriceName: 'enterprise',
                    }}
                />
            </Provider>
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
    })

    it('should render a featured card with a featured pill', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                    }}
                    isFeatured
                />
            </Provider>
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.getByText('Featured'))
    })

    it('should render a featured card without a featured pill', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                        categories: [Category.FEATURED],
                    }}
                    isFeatured
                    hasNoFeaturedPill
                />
            </Provider>
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.queryByText('Featured')).toBeNull()
    })

    it('should render a loading card', () => {
        render(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                    }}
                    isLoading
                />
            </Provider>
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
        expect(screen.getByTestId(LOADING_TEST_ID))
    })
})

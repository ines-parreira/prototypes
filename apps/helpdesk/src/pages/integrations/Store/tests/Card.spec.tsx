import { screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { applications as mockApplications } from 'fixtures/applications'
import { dummyAppListIntegrationItem, dummyAppListItem } from 'fixtures/apps'
import { IntegrationType } from 'models/integration/constants'
import { Category } from 'models/integration/types/app'
import { Application, getApplicationById } from 'services/applications'
import { renderWithRouter } from 'utils/testing'

import Card, { CARD_LINK_TEST_ID, LOADING_TEST_ID, Pills } from '../Card'

const mockStore = configureMockStore([thunk])
const store = mockStore({})

jest.mock('services/applications', () => ({
    getApplicationById: jest.fn(),
}))

describe('<Pills />', () => {
    it('should render an empty div', () => {
        const { container } = renderWithRouter(
            <Pills item={{ ...dummyAppListIntegrationItem, count: 0 }} />,
        )
        expect(container.firstChild?.firstChild).toBeNull()
    })
    it('should render the upgrade button', () => {
        renderWithRouter(
            <Pills
                item={{
                    ...dummyAppListIntegrationItem,
                    requiredPriceName: 'enterprise',
                }}
            />,
        )
        expect(screen.getByText('Upgrade'))
    })

    it('should render the number of install', () => {
        renderWithRouter(
            <Pills
                item={{
                    ...dummyAppListIntegrationItem,
                    count: 2,
                    type: IntegrationType.BigCommerce,
                }}
            />,
        )
        expect(screen.getByText('2'))
    })
    it('should render with a "Featured" label', () => {
        renderWithRouter(
            <Pills item={dummyAppListIntegrationItem} isFeatured />,
        )
        expect(screen.getByText('Featured'))
    })
})

describe('<Card />', () => {
    it('should render a basic link card with proper link', () => {
        const { container } = renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                        count: 1,
                        type: IntegrationType.BigCommerce,
                    }}
                />
            </Provider>,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a link to connections tab directly', () => {
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const { getByTestId } = renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                        count: 1,
                        type: IntegrationType.App,
                        appId: application.id,
                    }}
                />
            </Provider>,
        )
        expect(getByTestId('card-link')).toHaveAttribute(
            'href',
            `/app/settings/integrations/app/${application.id}/connections`,
        )
    })

    it('should render a link to app if no integrations yet', () => {
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const { getByTestId } = renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListItem,
                        count: 0,
                        type: IntegrationType.App,
                        appId: application.id,
                    }}
                />
            </Provider>,
        )
        expect(getByTestId('card-link')).toHaveAttribute(
            'href',
            `/app/settings/integrations/app/${application.id}`,
        )
    })

    it('should render div card', () => {
        renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                        requiredPriceName: 'enterprise',
                    }}
                />
            </Provider>,
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
    })

    it('should render a featured card with a featured pill', () => {
        renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                    }}
                    isFeatured
                />
            </Provider>,
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.getByText('Featured'))
    })

    it('should render a featured card without a featured pill', () => {
        renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                        categories: [Category.FEATURED],
                    }}
                    isFeatured
                    hasNoFeaturedPill
                />
            </Provider>,
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.queryByText('Featured')).toBeNull()
    })

    it('should render a loading card', () => {
        renderWithRouter(
            <Provider store={store}>
                <Card
                    item={{
                        ...dummyAppListIntegrationItem,
                    }}
                    isLoading
                />
            </Provider>,
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
        expect(screen.getByTestId(LOADING_TEST_ID))
    })
})

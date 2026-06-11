import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { applications as mockApplications } from 'fixtures/applications'
import { dummyAppListIntegrationItem, dummyAppListItem } from 'fixtures/apps'
import { IntegrationType } from 'models/integration/constants'
import { Category } from 'models/integration/types/app'
import type { Application } from 'services/applications'
import { getApplicationById } from 'services/applications'

import { Card, CARD_LINK_TEST_ID, LOADING_TEST_ID, Pills } from '../Card'

const mockStore = configureMockStore([thunk])
const store = mockStore({})
jest.mock('services/applications', () => ({
    getApplicationById: jest.fn(),
}))
describe('<Pills />', () => {
    it('should render an empty div', () => {
        const { container } = render(
            <Pills item={{ ...dummyAppListIntegrationItem, count: 0 }} />,
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
            />,
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
            />,
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
        const { container } = render(
            <Card
                item={{
                    ...dummyAppListIntegrationItem,
                    count: 1,
                    type: IntegrationType.BigCommerce,
                }}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(container.firstChild).toMatchSnapshot()
    })
    it('should render a link to credentials tab directly', () => {
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const { getByTestId } = render(
            <Card
                item={{
                    ...dummyAppListItem,
                    count: 1,
                    type: IntegrationType.App,
                    appId: application.id,
                }}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(getByTestId('card-link')).toHaveAttribute(
            'href',
            `/app/settings/integrations/app/${application.id}/credentials`,
        )
    })
    it('should render a link to app if no integrations yet', () => {
        const mockedGetApplicationById =
            getApplicationById as jest.Mock<Application>
        const application = mockApplications[0]
        application.supports_multiple_connections = true
        mockedGetApplicationById.mockReturnValue(application)
        const { getByTestId } = render(
            <Card
                item={{
                    ...dummyAppListItem,
                    count: 0,
                    type: IntegrationType.App,
                    appId: application.id,
                }}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(getByTestId('card-link')).toHaveAttribute(
            'href',
            `/app/settings/integrations/app/${application.id}`,
        )
    })
    it('should render div card', () => {
        render(
            <Card
                item={{
                    ...dummyAppListIntegrationItem,
                    requiredPriceName: 'enterprise',
                }}
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
    })
    it('should render a featured card with a featured pill', () => {
        render(
            <Card
                item={{
                    ...dummyAppListIntegrationItem,
                }}
                isFeatured
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.getByText('Featured'))
    })
    it('should render a featured card without a featured pill', () => {
        render(
            <Card
                item={{
                    ...dummyAppListIntegrationItem,
                    categories: [Category.FEATURED],
                }}
                isFeatured
                hasNoFeaturedPill
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.getByTestId(CARD_LINK_TEST_ID)).toHaveClass('featured')
        expect(screen.queryByText('Featured')).toBeNull()
    })
    it('should render a loading card', () => {
        render(
            <Card
                item={{
                    ...dummyAppListIntegrationItem,
                }}
                isLoading
            />,
            {
                storeState: store.getState() as object,
            },
        )
        expect(screen.queryByTestId(CARD_LINK_TEST_ID)).toBeNull()
        expect(screen.getByTestId(LOADING_TEST_ID))
    })
})

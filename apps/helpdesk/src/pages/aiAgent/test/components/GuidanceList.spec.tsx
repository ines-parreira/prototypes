import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { userEvent } from '@repo/testing'
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import { useGetGuidancesAvailableActions } from 'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import type { GuidanceArticle } from 'pages/aiAgent/types'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'

import { GuidanceList } from '../../components/GuidanceList/GuidanceList'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')
jest.mock(
    'pages/aiAgent/components/GuidanceEditor/useGetGuidancesAvailableActions',
    () => ({
        useGetGuidancesAvailableActions: jest.fn(),
    }),
)
jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

const mockedUseStoreIntegrations = jest.mocked(useStoreIntegrations)
const mockedUseGetGuidancesAvailableActions = jest.mocked(
    useGetGuidancesAvailableActions,
)
const mockStore = configureMockStore([thunk])

describe('<GuidanceList />', () => {
    // Using simplified mock objects as used in the container test
    const defaultStoreIntegrations = [
        { id: 1, name: 'test-shop', type: IntegrationType.Shopify },
        { id: 2, name: 'another-shop', type: IntegrationType.Shopify },
    ]

    const mockHandlers = {
        onDelete: jest.fn(),
        onDuplicate: jest.fn(),
        onRowClick: jest.fn(),
        onChangeVisibility: jest.fn(),
    }

    const renderWithRedux = (ui: React.ReactElement) => {
        const store = mockStore({
            settings: {
                dateAndTimeFormat: {
                    dateFormat: 'DD/MM/YYYY',
                    timeFormat: 'HH:mm',
                },
            },
        })
        return render(<Provider store={store}>{ui}</Provider>)
    }

    beforeEach(() => {
        jest.clearAllMocks()

        mockedUseStoreIntegrations.mockReturnValue(
            defaultStoreIntegrations as any,
        )
        mockedUseGetGuidancesAvailableActions.mockReturnValue({
            guidanceActions: [
                {
                    name: 'Action 1',
                    value: 'action-1',
                },
                {
                    name: 'Action 2',
                    value: 'action-2',
                },
            ],
            isLoading: false,
        })

        mockUseFlag.mockReturnValue(false)
    })

    it('should render guidance articles list', () => {
        const guidanceArticles = [
            getGuidanceArticleFixture(1, { title: 'First guidance' }),
            getGuidanceArticleFixture(2, {
                title: 'Second guidance',
                content:
                    'Content 2 with action $$$action-1$$$ and $$$action-2$$$',
            }),
        ]

        renderWithRedux(
            <GuidanceList
                guidanceArticles={guidanceArticles}
                currentStoreIntegrationId={1}
                shopName="test-shop"
                shopType="shopify"
                {...mockHandlers}
            />,
        )

        expect(screen.getByText('First guidance')).toBeInTheDocument()
        expect(screen.getByText('Second guidance')).toBeInTheDocument()

        expect(
            screen.queryByText('2 Actions used: Action 1, Action 2'),
        ).not.toBeInTheDocument()

        fireEvent.click(screen.getByText('First guidance'))

        expect(mockHandlers.onRowClick).toHaveBeenCalledWith(
            guidanceArticles[0].id,
        )
    })

    it('should render guidance actions badge', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error')
        mockUseFlag.mockReturnValue(true)

        const guidanceArticles = [
            getGuidanceArticleFixture(1, { title: 'First guidance' }),
            getGuidanceArticleFixture(2, {
                title: 'Second guidance',
                content:
                    'Content 2 with action $$$action-1$$$ and $$$action-2$$$ and non-existing $$$noaction$$$',
            }),
        ]

        const { container } = renderWithRedux(
            <GuidanceList
                guidanceArticles={guidanceArticles}
                currentStoreIntegrationId={1}
                shopName="test-shop"
                shopType="shopify"
                {...mockHandlers}
            />,
        )

        fireEvent.mouseOver(
            container.querySelector('img[alt="action logo"]') as HTMLElement,
        )

        await waitFor(() => {
            expect(screen.getByText('Action 1, Action 2')).toBeInTheDocument()
        })

        expect(screen.getByText('First guidance')).toBeInTheDocument()
        expect(screen.getByText('Second guidance')).toBeInTheDocument()

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'No action found for id noaction',
        )
    })

    describe('duplicate functionality', () => {
        it('should show duplicate button for each guidance', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1),
                getGuidanceArticleFixture(2),
            ]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            const duplicateButtons = screen.getAllByRole('button', {
                name: 'Duplicate guidance',
            })
            expect(duplicateButtons).toHaveLength(2)
        })

        it('should open dropdown when clicking duplicate button', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            expect(screen.getByText('DUPLICATE TO')).toBeInTheDocument()
            expect(screen.getByText(/test-shop/)).toBeInTheDocument()
            expect(screen.getByText('another-shop')).toBeInTheDocument()
        })

        it('should mark current store integration in dropdown', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            expect(
                screen.getByText(/test-shop \(current store\)/),
            ).toBeInTheDocument()
            expect(
                screen.queryByText(/another-shop \(current store\)/),
            ).not.toBeInTheDocument()
        })

        it('should call onDuplicate when selecting from dropdown', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )
            userEvent.click(screen.getByText('another-shop'))

            expect(mockHandlers.onDuplicate).toHaveBeenCalledWith(
                guidanceArticles[0].id,
                defaultStoreIntegrations[1],
            )
        })

        it('should close dropdown after selection', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )
            expect(screen.getByText('DUPLICATE TO')).toBeInTheDocument()

            userEvent.click(screen.getByText('another-shop'))
            expect(screen.queryByText('DUPLICATE TO')).not.toBeInTheDocument()
        })

        it('should sort store integrations with current one first', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            // Set the current store integration to the second one
            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={2}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            // Get all dropdown items
            const dropdownItems = screen.getAllByRole('option')

            // Check that the current store (another-shop) is now first in the list
            expect(
                within(dropdownItems[0]).getByText(/another-shop/),
            ).toBeInTheDocument()
            expect(
                within(dropdownItems[1]).getByText(/test-shop/),
            ).toBeInTheDocument()
        })
    })

    describe('search functionality', () => {
        it('should call onSearch when clicking reset search link', () => {
            const onSearch = jest.fn()
            const guidanceArticles: GuidanceArticle[] = []

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    onSearch={onSearch}
                    {...mockHandlers}
                />,
            )

            fireEvent.click(screen.getByText('Reset Search'))
            expect(onSearch).toHaveBeenCalledWith('')
        })

        it('should not call onSearch when prop is not provided', () => {
            const guidanceArticles: GuidanceArticle[] = []

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            // Clicking the link should not throw any errors
            fireEvent.click(screen.getByText('Reset Search'))
        })
    })

    describe('sorting with undefined values', () => {
        it('should show articles with undefined title at the end when sorting by title', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, { title: 'Beta guidance' }),
                { ...getGuidanceArticleFixture(2), title: undefined as any },
                getGuidanceArticleFixture(3, { title: 'Alpha guidance' }),
                { ...getGuidanceArticleFixture(4), title: undefined as any },
            ]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            // Click on Guidance name header to sort by title
            fireEvent.click(screen.getByText('Guidance name'))

            const rows = screen.getAllByRole('row')
            // First row is header, so data rows start at index 1
            expect(
                within(rows[1]).getByText('Alpha guidance'),
            ).toBeInTheDocument()
            expect(
                within(rows[2]).getByText('Beta guidance'),
            ).toBeInTheDocument()
            // Articles with undefined titles should be at the end
            expect(rows).toHaveLength(5) // 1 header + 4 data rows
        })

        it('should handle mixed valid and undefined/null titles without throwing errors', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, { title: 'Charlie' }),
                { ...getGuidanceArticleFixture(2), title: undefined as any },
                getGuidanceArticleFixture(3, { title: 'Alice' }),
                { ...getGuidanceArticleFixture(4), title: null as any },
                getGuidanceArticleFixture(5, { title: 'Bob' }),
            ]

            renderWithRedux(
                <GuidanceList
                    guidanceArticles={guidanceArticles}
                    currentStoreIntegrationId={1}
                    shopName="test-shop"
                    shopType="shopify"
                    {...mockHandlers}
                />,
            )

            // Click to sort ascending
            fireEvent.click(screen.getByText('Guidance name'))

            const rows = screen.getAllByRole('row')
            // Verify proper sorting order: Alice, Bob, Charlie, then undefined/null
            expect(within(rows[1]).getByText('Alice')).toBeInTheDocument()
            expect(within(rows[2]).getByText('Bob')).toBeInTheDocument()
            expect(within(rows[3]).getByText('Charlie')).toBeInTheDocument()
            // Rows 4 and 5 should be the undefined/null titled articles
            expect(rows).toHaveLength(6) // 1 header + 5 data rows
        })
    })
})

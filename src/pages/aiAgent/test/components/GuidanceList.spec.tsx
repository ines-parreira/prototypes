import React from 'react'

import { render, screen, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { IntegrationType } from 'models/integration/constants'
import { getGuidanceArticleFixture } from 'pages/aiAgent/fixtures/guidanceArticle.fixture'
import useStoreIntegrations from 'pages/automate/common/hooks/useStoreIntegrations'
import { userEvent } from 'utils/testing/userEvent'

import { GuidanceList } from '../../components/GuidanceList/GuidanceList'

jest.mock('pages/automate/common/hooks/useStoreIntegrations')

const mockedUseStoreIntegrations = jest.mocked(useStoreIntegrations)
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
    })

    it('should render guidance articles list', () => {
        const guidanceArticles = [
            getGuidanceArticleFixture(1, { title: 'First guidance' }),
            getGuidanceArticleFixture(2, { title: 'Second guidance' }),
        ]

        renderWithRedux(
            <GuidanceList
                guidanceArticles={guidanceArticles}
                currentStoreIntegrationId={1}
                {...mockHandlers}
            />,
        )

        expect(screen.getByText('First guidance')).toBeInTheDocument()
        expect(screen.getByText('Second guidance')).toBeInTheDocument()
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
})

// must be kept as first import in the file
import 'pages/aiAgent/test/mock-activation-hooks.utils'

import { useFlag } from '@repo/feature-flags'
import { history } from '@repo/routing'
import { assumeMock, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { toImmutable } from 'common/utils'
import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import useAppDispatch from 'hooks/useAppDispatch'
import { useGetHelpCenterList } from 'models/helpCenter/queries'
import { useAiAgentEnabled } from 'pages/aiAgent/hooks/useAiAgentEnabled'
import { getHelpCentersResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import { notify } from 'state/notifications/actions'
import { NotificationStatus } from 'state/notifications/types'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { reportError } from 'utils/errors'
import { renderWithRouter } from 'utils/testing'

import {
    useStoreActivations,
    useStoreConfigurations,
} from '../Activation/hooks/useStoreActivations'
import { AiAgentGuidanceContainer } from '../AiAgentGuidanceContainer'
import {
    GUIDANCE_ARTICLE_LIMIT,
    GUIDANCE_ARTICLE_LIMIT_WARNING,
    KNOWLEDGE,
    NEW_GUIDANCE_ARTICLE_LIMIT,
    NEW_GUIDANCE_ARTICLE_LIMIT_WARNING,
} from '../constants'
import { getGuidanceArticleFixture } from '../fixtures/guidanceArticle.fixture'
import { getStoreConfigurationFixture } from '../fixtures/storeConfiguration.fixtures'
import { useGuidanceAiSuggestions } from '../hooks/useGuidanceAiSuggestions'
import { useGuidanceArticleMutation } from '../hooks/useGuidanceArticleMutation'
import { useGuidanceArticles } from '../hooks/useGuidanceArticles'
import { useAiAgentStoreConfigurationContext } from '../providers/AiAgentStoreConfigurationContext'

jest.mock('@repo/routing', () => ({
    ...jest.requireActual('@repo/routing'),
    history: {
        push: jest.fn(),
    },
}))
jest.mock('hooks/useAppDispatch', () => jest.fn())
const useAppDispatchMock = assumeMock(useAppDispatch)
jest.mock('state/notifications/actions')

jest.mock('sanitize-html', () => () => jest.fn())
jest.mock('utils/errors', () => ({
    reportError: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticles', () => ({
    useGuidanceArticles: jest.fn(),
}))
jest.mock('../hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(),
}))

jest.mock('../hooks/useGuidanceAiSuggestions', () => ({
    useGuidanceAiSuggestions: jest.fn(),
}))

jest.mock('../providers/AiAgentStoreConfigurationContext', () => ({
    useAiAgentStoreConfigurationContext: jest.fn(),
}))

jest.mock('hooks/useGetDateAndTimeFormat', () => () => 'DD/MM/YYYY')

jest.mock('models/helpCenter/queries')

jest.mock('pages/aiAgent/hooks/useAiAgentEnabled')

jest.mock('pages/aiAgent/hooks/useAccountStoreConfiguration', () => ({
    useAccountStoreConfiguration: () => ({
        aiAgentTicketViewId: 1,
    }),
}))

jest.mock('pages/automate/common/hooks/useStoreIntegrations', () => ({
    __esModule: true,
    default: () => [
        {
            id: 1,
            name: 'test-shop',
            type: 'shopify',
            meta: { shopName: 'test-shop' },
        },
        {
            id: 2,
            name: 'another-shop',
            type: 'shopify',
            meta: { shopName: 'another-shop' },
        },
    ],
}))

jest.mock('pages/automate/common/hooks/useSelfServiceStoreIntegration', () => ({
    __esModule: true,
    default: () => ({ id: 1, name: 'test-shop', type: 'shopify' }),
}))
jest.mock('pages/aiAgent/Activation/hooks/useStoreActivations.ts')
const useStoreActivationsMock = assumeMock(useStoreActivations)
const useStoreConfigurationsMock = assumeMock(useStoreConfigurations)

jest.mock('@repo/feature-flags')
const mockUseFlag = assumeMock(useFlag)

const queryClient = mockQueryClient()

const mockedUseGuidanceArticles = jest.mocked(useGuidanceArticles)
const mockedUseGuidanceArticleMutation = jest.mocked(useGuidanceArticleMutation)
const mockedUseGuidanceAiSuggestions = jest.mocked(useGuidanceAiSuggestions)
const mockUseGetHelpCenterList = jest.mocked(useGetHelpCenterList)
const mockedUseAiAgentStoreConfigurationContext = assumeMock(
    useAiAgentStoreConfigurationContext,
)
const mockUseEnableAiAgent = jest.mocked(useAiAgentEnabled)

const helpCenter = {
    ...getHelpCentersResponseFixture.data[0],
    type: 'guidance',
}
const defaultGuidanceArticleProps: ReturnType<typeof useGuidanceArticles> = {
    guidanceArticles: [],
    isGuidanceArticleListLoading: false,
    isFetched: true,
}
const defaultGuidanceArticleMutationProps: ReturnType<
    typeof useGuidanceArticleMutation
> = {
    createGuidanceArticle: jest.fn(),
    deleteGuidanceArticle: jest.fn(),
    updateGuidanceArticle: jest.fn(),
    isGuidanceArticleUpdating: false,
    isGuidanceArticleDeleting: false,
    duplicate: jest.fn(),
    duplicateGuidanceArticle: jest.fn(),
    discardGuidanceDraft: jest.fn(),
    isDiscardingDraft: false,
    rebasePublishGuidanceArticle: jest.fn(),
    getGuidanceArticleTranslation: jest.fn(),
}

const defaultGuidanceAiSuggestionsProps: ReturnType<
    typeof useGuidanceAiSuggestions
> = {
    guidanceArticles: [],
    guidanceUsed: [],
    guidanceAISuggestions: [],
    isLoadingAiGuidances: false,
    isLoadingGuidanceArticleList: false,
    isAllAIGuidancesUsed: false,
    isEmptyStateNoAIGuidances: false,
    isEmptyStateAIGuidances: false,
    isGuidancesOnly: false,
    isGuidancesAndAIGuidances: false,
    invalidateAiGuidances: jest.fn(),
}

const mockStore = configureMockStore([thunk])

const renderComponent = () => {
    renderWithRouter(
        <QueryClientProvider client={queryClient}>
            <Provider
                store={mockStore({
                    entities: {
                        helpCenter: {
                            helpCenters: {
                                helpCentersById: {
                                    [helpCenter.id]: helpCenter,
                                },
                            },
                        },
                    },
                    billing: toImmutable({
                        products: [],
                    }),
                    integrations: toImmutable({
                        integrations: [],
                    }),
                })}
            >
                <AiAgentGuidanceContainer />
            </Provider>
        </QueryClientProvider>,
        {
            path: `/:shopType/:shopName/ai-agent/guidance`,
            route: '/shopify/test-shop/ai-agent/guidance',
        },
    )
}

const mockedAiAgentStoreConfigurationContext = {
    isLoading: false,
    updateStoreConfiguration: jest.fn(),
    createStoreConfiguration: jest.fn(),
    isPendingCreateOrUpdate: false,
}
const dispatchMock = jest.fn()

describe('<AiAgentGuidanceContainer />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture({
                guidanceHelpCenterId: helpCenter.id,
            }),
        })
        mockedUseGuidanceArticles.mockReturnValue(defaultGuidanceArticleProps)
        mockedUseGuidanceArticleMutation.mockReturnValue(
            defaultGuidanceArticleMutationProps,
        )
        mockedUseGuidanceAiSuggestions.mockReturnValue(
            defaultGuidanceAiSuggestionsProps,
        )
        mockUseGetHelpCenterList.mockReturnValue({
            data: axiosSuccessResponse({
                data: [helpCenter],
            }),
            isLoading: false,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)

        mockUseEnableAiAgent.mockReturnValue({
            updateSettingsAfterAiAgentEnabled: jest.fn(),
        })

        useStoreConfigurationsMock.mockReturnValue({
            storeConfigurations: [],
        } as any)
        useStoreActivationsMock.mockReturnValue({
            storeActivations: {},
        } as any)

        useAppDispatchMock.mockReturnValue(dispatchMock)
    })

    it('should render loader', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: undefined,
            isLoading: true,
        })
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument
    })

    it('should render loader if help centers are loading', () => {
        mockUseGetHelpCenterList.mockReturnValue({
            data: undefined,
            isLoading: true,
        } as unknown as ReturnType<typeof useGetHelpCenterList>)
        renderComponent()
        expect(screen.getByText('Loading...')).toBeInTheDocument
    })

    it('should render alert about store configuration', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: undefined,
            isLoading: false,
        })

        renderComponent()

        expect(
            screen.getByText((text) => text.includes('Please configure')),
        ).toBeInTheDocument()
    })

    it('should report error when guidance help center is not found', () => {
        mockedUseAiAgentStoreConfigurationContext.mockReturnValue({
            ...mockedAiAgentStoreConfigurationContext,
            storeConfiguration: getStoreConfigurationFixture({
                guidanceHelpCenterId: undefined,
            }),
            isLoading: false,
        })
        renderComponent()
        expect(reportError).toHaveBeenCalled()
    })

    it('should render empty state component', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateNoAIGuidances: true,
        })

        renderComponent()

        expect(screen.getByText('Create Custom Guidance')).toBeInTheDocument()
        expect(screen.getByText('Create From Template')).toBeInTheDocument()
    })

    it('should render empty state component with ai guidances', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateAIGuidances: true,
        })

        renderComponent()

        expect(
            screen.getByText(
                /Add Guidance to tell AI Agent how to handle specific/,
            ),
        ).toBeInTheDocument()

        const createCustomGuidanceButton = screen.getByText(
            'Create Custom Guidance',
        )
        userEvent.click(createCustomGuidanceButton)

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/guidance/new',
        )
    })

    it('should render guidance page with title "Knowledge"', () => {
        renderComponent()

        expect(
            screen.queryByText(KNOWLEDGE, { selector: 'h1' }),
        ).toBeInTheDocument()
    })

    it('should redirect to guidance library page on click', () => {
        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isEmptyStateAIGuidances: true,
        })

        renderComponent()

        const browseSuggestions = screen.getByText('Start from Template')
        userEvent.click(browseSuggestions)

        expect(history.push).toHaveBeenCalledWith(
            '/app/ai-agent/shopify/test-shop/knowledge/guidance/library',
        )
    })

    describe("when there's guidance articles", () => {
        it('should render guidances and AI guidances', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesAndAIGuidances: true,
                guidanceArticles,
                guidanceAISuggestions: [{ name: 'AI Guidance 1' } as any],
            })

            renderComponent()

            expect(screen.getByText('AI Guidance 1')).toBeInTheDocument()

            expect(
                screen.queryByRole('button', { name: 'Create From Template' }),
            ).not.toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Start from Template' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Create Custom Guidance' }),
            ).toBeInTheDocument()
        })

        it('should render guidance list', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByText(guidanceArticles[0].title),
            ).toBeInTheDocument()
        })

        it('should call delete action when delete button is clicked', () => {
            const deleteGuidanceArticle = jest.fn()
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })
            mockedUseGuidanceArticleMutation.mockReturnValue({
                ...defaultGuidanceArticleMutationProps,
                deleteGuidanceArticle,
            })

            renderComponent()

            userEvent.click(
                screen.getByRole('button', { name: 'Delete guidance' }),
            )

            userEvent.click(screen.getByText('Delete'))

            expect(deleteGuidanceArticle).toHaveBeenCalledWith(
                guidanceArticles[0].id,
            )
        })

        it('should call duplicate action when duplicate button is clicked', () => {
            const duplicateGuidanceArticle = jest.fn()
            const guidanceArticles = [getGuidanceArticleFixture(1)]
            const storeIntegration = {
                id: 1,
                name: 'test-shop',
                type: 'shopify',
            }

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })
            mockedUseGuidanceArticleMutation.mockReturnValue({
                ...defaultGuidanceArticleMutationProps,
                duplicateGuidanceArticle,
            })

            renderComponent()

            duplicateGuidanceArticle(guidanceArticles[0].id, storeIntegration)

            expect(duplicateGuidanceArticle).toHaveBeenCalledWith(
                guidanceArticles[0].id,
                storeIntegration,
            )
        })

        it('should open the dropdown when clicking the duplicate button', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            expect(screen.getByText('DUPLICATE TO')).toBeInTheDocument()
            expect(screen.getByText(/test-shop/)).toBeInTheDocument()
            expect(screen.getByText(/another-shop/)).toBeInTheDocument()
        })

        it('should close the dropdown after selecting a store', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            expect(screen.getByText('DUPLICATE TO')).toBeInTheDocument()

            userEvent.click(screen.getByText('another-shop'))

            expect(screen.queryByText('DUPLICATE TO')).not.toBeInTheDocument()
        })

        it('should show the current store indicator in dropdown', () => {
            const guidanceArticles = [getGuidanceArticleFixture(1)]

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            userEvent.click(
                screen.getByRole('button', { name: 'Duplicate guidance' }),
            )

            expect(
                screen.getByText(/test-shop \(current store\)/),
            ).toBeInTheDocument()
            expect(screen.getByText('another-shop')).toBeInTheDocument()
            expect(
                screen.queryByText(/another-shop \(current store\)/),
            ).not.toBeInTheDocument()
        })

        it('should show warning with the new guidance article limit when increaseGuidanceCreationLimitation feature flag is true', () => {
            mockUseFlag.mockReturnValue(true)
            const guidanceArticles = Array(NEW_GUIDANCE_ARTICLE_LIMIT_WARNING)
                .fill(null)
                .map((_, index) => getGuidanceArticleFixture(index))
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByText((content) =>
                    content.includes(
                        `${NEW_GUIDANCE_ARTICLE_LIMIT_WARNING} out of ${NEW_GUIDANCE_ARTICLE_LIMIT}`,
                    ),
                ),
            ).toBeInTheDocument()
        })

        it('should show warning about guidance article limit and dismiss the warning when dismiss button is clicked', () => {
            mockUseFlag.mockReturnValue(false)

            const guidanceArticles = Array(GUIDANCE_ARTICLE_LIMIT_WARNING)
                .fill(null)
                .map((_, index) => getGuidanceArticleFixture(index))
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByText((content) =>
                    content.includes(
                        `${GUIDANCE_ARTICLE_LIMIT_WARNING} out of ${GUIDANCE_ARTICLE_LIMIT}`,
                    ),
                ),
            ).toBeInTheDocument()

            const dismissButton = screen.getByLabelText('Close')
            fireEvent.click(dismissButton)

            expect(
                screen.queryByText((content) =>
                    content.includes(
                        `${GUIDANCE_ARTICLE_LIMIT_WARNING} out of ${GUIDANCE_ARTICLE_LIMIT}`,
                    ),
                ),
            ).not.toBeInTheDocument()
        })

        it('should disable creation button when guidance limit reached', () => {
            mockUseFlag.mockReturnValue(false)

            const guidanceArticles = Array(GUIDANCE_ARTICLE_LIMIT)
                .fill(null)
                .map((_, index) => getGuidanceArticleFixture(index))
            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesAndAIGuidances: false,
                guidanceArticles,
            })

            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Start From Template' }),
            ).toBeAriaDisabled()
        })

        it('should sort guidance articles by last updated', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, {
                    title: 'Old article',
                    lastUpdated: '2024-03-18T12:21:00.531Z',
                }),
                getGuidanceArticleFixture(2, {
                    title: 'New article',
                    lastUpdated: '2024-04-18T12:21:00.531Z',
                }),
            ]

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            renderComponent()

            // Check first row title. Should be Asc by default
            expect(document.querySelector('tbody tr')).toHaveTextContent(
                'New article',
            )

            userEvent.click(screen.getByText('Last updated'))

            // Check first row title. Should be Desc after click
            expect(document.querySelector('tbody tr')).toHaveTextContent(
                'Old article',
            )
        })

        it('should change guidance visibility', () => {
            const guidanceArticles = [
                getGuidanceArticleFixture(1, {
                    title: 'Old article',
                    lastUpdated: '2024-03-18T12:21:00.531Z',
                }),
                getGuidanceArticleFixture(2, {
                    title: 'New article',
                    lastUpdated: '2024-04-18T12:21:00.531Z',
                }),
            ]
            const updateGuidanceArticle = jest.fn()

            mockedUseGuidanceAiSuggestions.mockReturnValue({
                ...defaultGuidanceAiSuggestionsProps,
                isGuidancesOnly: true,
                guidanceArticles,
            })

            mockedUseGuidanceArticleMutation.mockReturnValue({
                ...defaultGuidanceArticleMutationProps,
                updateGuidanceArticle,
            })

            renderComponent()

            const firstRowToggle = within(
                document.querySelector('tbody tr')!,
            ).getByRole('checkbox', { name: 'Toggle guidance visibility' })

            expect(firstRowToggle).toBeChecked()

            fireEvent.click(firstRowToggle)

            expect(updateGuidanceArticle).toHaveBeenCalledWith(
                {
                    visibility: 'UNLISTED',
                },
                {
                    articleId: guidanceArticles[0].id,
                    locale: guidanceArticles[0].locale,
                },
            )
        })
    })

    it('should show error notification when duplicateGuidanceArticle throws', async () => {
        const duplicateGuidanceArticle = jest
            .fn()
            .mockRejectedValue(new Error('fail'))
        const guidanceArticles = [getGuidanceArticleFixture(1)]

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isGuidancesOnly: true,
            guidanceArticles,
        })
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            duplicateGuidanceArticle,
        })

        renderComponent()

        // Click duplicate button to open dropdown
        fireEvent.click(
            screen.getByRole('button', { name: 'Duplicate guidance' }),
        )

        // Wait for dropdown to open
        await waitFor(() => {
            expect(screen.getByText('DUPLICATE TO')).toBeInTheDocument()
        })

        fireEvent.click(screen.getByText('another-shop'))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: `Error during guidance article duplication.`,
                status: NotificationStatus.Error,
            })
        })
    })

    it('should show already exists error notification when duplicateGuidanceArticle throws with duplicate error', async () => {
        const duplicateGuidanceArticle = jest.fn().mockRejectedValue({
            isAxiosError: true,
            response: {
                data: {
                    error: {
                        msg: 'A guidance with this name already exists',
                    },
                },
            },
        })
        const guidanceArticles = [getGuidanceArticleFixture(1)]

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isGuidancesOnly: true,
            guidanceArticles,
        })
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            duplicateGuidanceArticle,
        })

        renderComponent()

        // Open duplicate dropdown
        fireEvent.click(
            screen.getByRole('button', { name: 'Duplicate guidance' }),
        )
        await waitFor(() => {
            expect(screen.getByText('another-shop')).toBeInTheDocument()
        })

        // Select another shop to trigger duplication
        fireEvent.click(screen.getByText('another-shop'))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                status: NotificationStatus.Error,
                message: 'A guidance with this name already exists',
            })
        })
    })

    it('should show generic error notification when duplicateGuidanceArticle throws with API error but no duplicate message', async () => {
        const duplicateGuidanceArticle = jest.fn().mockRejectedValue({
            isAxiosError: true,
            response: {
                data: {
                    error: {
                        msg: 'Some other API error',
                    },
                },
            },
        })
        const guidanceArticles = [getGuidanceArticleFixture(1)]

        mockedUseGuidanceAiSuggestions.mockReturnValue({
            ...defaultGuidanceAiSuggestionsProps,
            isGuidancesOnly: true,
            guidanceArticles,
        })
        mockedUseGuidanceArticleMutation.mockReturnValue({
            ...defaultGuidanceArticleMutationProps,
            duplicateGuidanceArticle,
        })

        renderComponent()

        // Open duplicate dropdown
        fireEvent.click(
            screen.getByRole('button', { name: 'Duplicate guidance' }),
        )
        await waitFor(() => {
            expect(screen.getByText('another-shop')).toBeInTheDocument()
        })

        // Select another shop to trigger duplication
        fireEvent.click(screen.getByText('another-shop'))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                status: NotificationStatus.Error,
                message: 'Error during guidance article duplication.',
            })
        })
    })
})

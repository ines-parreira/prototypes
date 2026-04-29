import { render } from '@repo/testing'
import { QueryClient } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import type { TransformedIntent } from '../../hooks/useIntentsTable'
import { useIntentsTable } from '../../hooks/useIntentsTable'
import { useSkillsArticles } from '../../hooks/useSkillsArticles'
import type { TransformedArticle } from '../../types'
import { IntentStatus } from '../../types'
import { MetricCell } from '../SharedTableComponents/MetricCells'
import { IntentsTable } from './IntentsTable'
import { LinkToSkillModal } from './LinkToSkillModal'

const mockUpdateIntentStatus = jest.fn().mockResolvedValue(undefined)
const mockUpdateGuidanceArticle = jest.fn().mockResolvedValue(undefined)
const mockPush = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({ push: mockPush }),
}))
jest.mock('pages/aiAgent/hooks/useAiAgentNavigation', () => ({
    useAiAgentNavigation: () => ({
        routes: {
            skills: '/app/ai-agent/shopify/test-shop/skills',
            skillDetail: (id: number) =>
                `/app/ai-agent/shopify/test-shop/skills/${id}`,
            newSkill: '/app/ai-agent/shopify/test-shop/skills/new',
        },
    }),
}))
jest.mock(
    'pages/settings/helpCenter/hooks/useStoreIntegrationByShopName',
    () => ({
        useStoreIntegrationByShopName: () => ({ id: 456 }),
    }),
)
jest.mock('../../hooks/useSkillsArticles')
jest.mock('pages/aiAgent/skills/hooks/useIntentsTable', () => ({
    ...jest.requireActual('pages/aiAgent/skills/hooks/useIntentsTable'),
    useIntentsTable: jest.fn(),
}))
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')
jest.mock('../SharedTableComponents/MetricCells', () => ({
    MetricCell: jest.fn(() => null),
}))
jest.mock(
    'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
    () => ({
        useGetCustomTicketsFieldsDefinitionData: jest.fn(() => ({
            outcomeCustomFieldId: undefined,
            intentCustomFieldId: undefined,
            sentimentCustomFieldId: null,
            isLoading: false,
        })),
    }),
)
jest.mock('hooks/integrations/useGetTicketChannelsStoreIntegrations', () => ({
    useGetTicketChannelsStoreIntegrations: jest.fn(() => []),
}))
jest.mock('pages/aiAgent/skills/hooks/useUpdateIntentStatus', () => ({
    useUpdateIntentStatus: jest.fn(() => ({
        updateIntentStatus: mockUpdateIntentStatus,
        isLoading: false,
    })),
}))
jest.mock('pages/aiAgent/hooks/useGuidanceArticleMutation', () => ({
    useGuidanceArticleMutation: jest.fn(() => ({
        updateGuidanceArticle: mockUpdateGuidanceArticle,
        isGuidanceArticleUpdating: false,
    })),
}))
jest.mock('./LinkToSkillModal', () => ({
    LinkToSkillModal: jest.fn(() => null),
}))
const mockUseIntentsTable = useIntentsTable as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock
const mockUseSkillsArticles = useSkillsArticles as jest.Mock
const mockStore = configureMockStore([thunk])
Element.prototype.getAnimations = jest.fn(() => [])
const createFindIntent =
    (intents: TransformedIntent[]) => (intentId: string) => {
        for (const intent of intents) {
            if (intent.id === intentId) return intent
            const child = intent.children?.find((c) => c.id === intentId)
            if (child) return child
        }
        return undefined
    }
describe('IntentsTable', () => {
    let __store: ReturnType<typeof mockStore>
    const mockIntents: TransformedIntent[] = [
        {
            id: 'order',
            name: 'order',
            formattedName: 'Order',
            toggleState: 'enabled',
            status: IntentStatus.NotLinked,
            children: [
                {
                    id: 'order::status',
                    name: 'order::status',
                    formattedName: 'Status',
                    description:
                        'Questions about order status or tracking information',
                    toggleState: 'enabled',
                    status: IntentStatus.NotLinked,
                    parentId: 'order',
                    articles: [],
                },
                {
                    id: 'order::cancel',
                    name: 'order::cancel',
                    formattedName: 'Cancel',
                    description: 'Requests to cancel an order',
                    toggleState: 'disabled',
                    status: IntentStatus.Handover,
                    parentId: 'order',
                    articles: [],
                },
            ],
        },
        {
            id: 'shipping',
            name: 'shipping',
            formattedName: 'Shipping',
            toggleState: 'enabled',
            status: IntentStatus.NotLinked,
            children: [
                {
                    id: 'shipping::delay',
                    name: 'shipping::delay',
                    formattedName: 'Delay',
                    description: 'Concerns about delayed package arrival',
                    toggleState: 'enabled',
                    status: IntentStatus.Linked,
                    parentId: 'shipping',
                    articles: [
                        {
                            id: 1,
                            locale: 'en-US',
                            article_translation_version_id: 123,
                            title: 'Shipping delays',
                            status: 'published',
                            template_key: 'ai_skill_1',
                            visibility_status: 'PUBLIC',
                        },
                    ],
                },
            ],
        },
        {
            id: 'other',
            name: 'other',
            formattedName: 'Other',
            toggleState: 'disabled',
            status: IntentStatus.NotLinked,
            children: [
                {
                    id: 'other::no reply',
                    name: 'other::no reply',
                    formattedName: 'No Reply',
                    description:
                        'Messages from customers not requiring a response',
                    toggleState: 'disabled',
                    status: IntentStatus.Handover,
                    parentId: 'other',
                    articles: [],
                },
                {
                    id: 'other::spam',
                    name: 'other::spam',
                    formattedName: 'Spam',
                    description: 'Spam messages',
                    toggleState: 'disabled',
                    status: IntentStatus.Handover,
                    parentId: 'other',
                    articles: [],
                },
            ],
        },
    ]
    beforeEach(() => {
        jest.clearAllMocks()
        mockUpdateIntentStatus.mockResolvedValue(undefined)
        mockUpdateGuidanceArticle.mockResolvedValue(undefined)
        mockPush.mockClear()
        mockUseSkillsArticles.mockReturnValue({
            articles: [],
            isLoading: false,
            isError: false,
            isMetricsLoading: false,
            metricsDateRange: undefined,
        })
        __store = mockStore({})
        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })
        mockUseIntentsTable.mockReturnValue({
            intents: mockIntents,
            findIntent: createFindIntent(mockIntents),
            isLoading: false,
            isError: false,
        })
    })
    const renderComponent = (props = {}) => {
        const __queryClient = new QueryClient({
            defaultOptions: { queries: { retry: false } },
        })
        const result = render(
            <ThemeProvider>
                <IntentsTable
                    isOpen={true}
                    onOpenChange={jest.fn()}
                    {...props}
                />
            </ThemeProvider>,
            {},
        )
        __store = result.store as ReturnType<typeof mockStore>

        return result
    }
    describe('Rendering', () => {
        it('should render table with L1 intents', () => {
            renderComponent()
            expect(screen.getByText('Order')).toBeInTheDocument()
            expect(screen.getByText('Shipping')).toBeInTheDocument()
            expect(screen.getByText('Other')).toBeInTheDocument()
        })
        it('should render column headers', () => {
            renderComponent()
            expect(screen.getByText('Intent')).toBeInTheDocument()
            expect(screen.getByText('Ticket volume')).toBeInTheDocument()
            expect(screen.getByText('Handover')).toBeInTheDocument()
            expect(screen.getByText('Enabled')).toBeInTheDocument()
        })
        it('should display intent count', () => {
            renderComponent()
            expect(screen.getByText('Showing 3 of 3 items')).toBeInTheDocument()
        })
        it('should render L2 intent descriptions when expanded', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButtons = screen.getAllByRole('button', {
                name: /expand/i,
            })
            await user.click(expandButtons[0])
            await waitFor(() => {
                expect(
                    screen.getByText(
                        'Questions about order status or tracking information',
                    ),
                ).toBeInTheDocument()
                expect(
                    screen.getByText('Requests to cancel an order'),
                ).toBeInTheDocument()
            })
        })
        it('should show loading state', () => {
            mockUseIntentsTable.mockReturnValue({
                intents: [],
                isLoading: true,
                isError: false,
            })
            renderComponent()
            const skeletons = screen.getAllByLabelText('Loading')
            expect(skeletons.length).toBeGreaterThan(0)
        })
    })
    describe('Sorting', () => {
        const intentsWithMetrics: TransformedIntent[] = [
            {
                id: 'shipping',
                name: 'shipping',
                formattedName: 'Shipping',
                toggleState: 'enabled',
                status: IntentStatus.NotLinked,
                metrics: {
                    ticketVolume: 50,
                    ticketVolumePercent: 25,
                    handoverCount: 5,
                    handoverPercent: 10,
                },
                children: [
                    {
                        id: 'shipping::delay',
                        name: 'shipping::delay',
                        formattedName: 'Delay',
                        toggleState: 'enabled',
                        status: IntentStatus.NotLinked,
                        parentId: 'shipping',
                        articles: [],
                        metrics: {
                            ticketVolume: 30,
                            ticketVolumePercent: 15,
                            handoverCount: 3,
                            handoverPercent: 10,
                        },
                    },
                    {
                        id: 'shipping::address',
                        name: 'shipping::address',
                        formattedName: 'Address',
                        toggleState: 'enabled',
                        status: IntentStatus.NotLinked,
                        parentId: 'shipping',
                        articles: [],
                        metrics: {
                            ticketVolume: 80,
                            ticketVolumePercent: 40,
                            handoverCount: 8,
                            handoverPercent: 10,
                        },
                    },
                ],
            },
            {
                id: 'order',
                name: 'order',
                formattedName: 'Order',
                toggleState: 'enabled',
                status: IntentStatus.NotLinked,
                metrics: {
                    ticketVolume: 200,
                    ticketVolumePercent: 60,
                    handoverCount: 20,
                    handoverPercent: 10,
                },
                children: [],
            },
            {
                id: 'other',
                name: 'other',
                formattedName: 'Other',
                toggleState: 'enabled',
                status: IntentStatus.NotLinked,
                metrics: {
                    ticketVolume: 10,
                    ticketVolumePercent: 5,
                    handoverCount: 1,
                    handoverPercent: 10,
                },
                children: [],
            },
        ]

        it('should sort L1 intents by ticket volume descending when metrics are available', () => {
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithMetrics,
                findIntent: createFindIntent(intentsWithMetrics),
                isLoading: false,
                isError: false,
            })

            renderComponent()

            const rows = screen.getAllByRole('row')
            const rowTexts = rows.map((r) => r.textContent ?? '')
            const orderIdx = rowTexts.findIndex((t) => t.includes('Order'))
            const shippingIdx = rowTexts.findIndex((t) =>
                t.includes('Shipping'),
            )
            const otherIdx = rowTexts.findIndex((t) => t.includes('Other'))

            expect(orderIdx).toBeLessThan(shippingIdx)
            expect(shippingIdx).toBeLessThan(otherIdx)
        })

        it('should sort L2 children by ticket volume descending when metrics are available', async () => {
            const user = userEvent.setup()
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithMetrics,
                findIntent: createFindIntent(intentsWithMetrics),
                isLoading: false,
                isError: false,
            })

            renderComponent()

            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)

            await waitFor(() => {
                const rows = screen.getAllByRole('row')
                const rowTexts = rows.map((r) => r.textContent ?? '')
                const addressIdx = rowTexts.findIndex((t) =>
                    t.includes('Address'),
                )
                const delayIdx = rowTexts.findIndex((t) => t.includes('Delay'))
                expect(addressIdx).toBeLessThan(delayIdx)
            })
        })

        it('should sort L1 intents alphabetically when no metrics are available', () => {
            renderComponent()

            const rows = screen.getAllByRole('row')
            const rowTexts = rows.map((r) => r.textContent ?? '')
            const orderIdx = rowTexts.findIndex((t) => t.includes('Order'))
            const otherIdx = rowTexts.findIndex((t) => t.includes('Other'))
            const shippingIdx = rowTexts.findIndex((t) =>
                t.includes('Shipping'),
            )

            expect(orderIdx).toBeLessThan(otherIdx)
            expect(otherIdx).toBeLessThan(shippingIdx)
        })
    })

    describe('Expand/Collapse', () => {
        it('should not show L2 children by default', () => {
            renderComponent()
            expect(screen.queryByText('Status')).not.toBeInTheDocument()
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
        })
        it('should show L2 children when L1 is expanded', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButtons = screen.getAllByRole('button', {
                name: /expand/i,
            })
            await user.click(expandButtons[0])
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
                expect(screen.getByText('Cancel')).toBeInTheDocument()
            })
        })
        it('should hide L2 children when L1 is collapsed', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const collapseButton = screen.getByRole('button', {
                name: /collapse/i,
            })
            await user.click(collapseButton)
            await waitFor(() => {
                expect(screen.queryByText('Status')).not.toBeInTheDocument()
            })
        })
    })
    describe('Search functionality', () => {
        it('should filter intents by L1 name', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'order')
            await waitFor(() => {
                expect(screen.getByText('Order')).toBeInTheDocument()
                expect(screen.queryByText('Shipping')).not.toBeInTheDocument()
            })
        })
        it('should filter intents by L2 name', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'delay')
            await waitFor(() => {
                expect(screen.getByText('Shipping')).toBeInTheDocument()
                expect(screen.queryByText('Order')).not.toBeInTheDocument()
            })
        })
        it('should update showing count after search', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'shipping')
            await waitFor(() => {
                expect(
                    screen.getByText('Showing 1 of 3 items'),
                ).toBeInTheDocument()
            })
        })
        it('should auto-expand children of a matching L1 intent without needing to click expand', async () => {
            const user = userEvent.setup()
            renderComponent()
            expect(screen.queryByText('Status')).not.toBeInTheDocument()
            expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'order')
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
                expect(screen.getByText('Cancel')).toBeInTheDocument()
            })
        })
        it('should auto-expand children when searching by L2 name and only show matching children', async () => {
            const user = userEvent.setup()
            renderComponent()
            expect(screen.queryByText('Delay')).not.toBeInTheDocument()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'delay')
            await waitFor(() => {
                expect(screen.getByText('Shipping')).toBeInTheDocument()
                expect(screen.getByText('Delay')).toBeInTheDocument()
            })
        })
        it('should only show matching L2 children and hide non-matching siblings when L2 name is searched', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'status')
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
                expect(screen.queryByText('Cancel')).not.toBeInTheDocument()
            })
        })
        it('should show all L2 children when the L1 name matches the search', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'order')
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
                expect(screen.getByText('Cancel')).toBeInTheDocument()
            })
        })
        it('should collapse children again when search is cleared', async () => {
            const user = userEvent.setup()
            renderComponent()
            const searchInput = screen.getByPlaceholderText('Search...')
            await user.type(searchInput, 'order')
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            await user.clear(searchInput)
            await waitFor(() => {
                expect(screen.queryByText('Status')).not.toBeInTheDocument()
            })
        })
    })
    describe('Display mode toggle', () => {
        it('should have percentage mode selected by default', () => {
            renderComponent()
            const percentageButton = screen.getByRole('radio', {
                name: /percent/i,
            })
            expect(percentageButton).toHaveAttribute('aria-checked', 'true')
        })
        it('should switch to numeric mode when clicked', async () => {
            const user = userEvent.setup()
            renderComponent()
            const numericButton = screen.getByRole('radio', {
                name: /hashtag/i,
            })
            await user.click(numericButton)
            expect(numericButton).toHaveAttribute('aria-checked', 'true')
        })
    })
    describe('Enabled toggle column', () => {
        it('should show disabled toggle for L1 intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                const toggles = screen.getAllByRole('switch')
                const l1Toggle = toggles[0]
                expect(l1Toggle).toBeDisabled()
            })
        })
        it('should show tooltip for disabled L1 toggle', async () => {
            const user = userEvent.setup()
            renderComponent()
            const toggles = screen.getAllByRole('switch')
            await user.hover(toggles[0])
            await waitFor(() => {
                expect(
                    screen.getByText(/This is an intent category/i),
                ).toBeInTheDocument()
            })
        })
        it('should show tooltip for a disabled (not handover-only) L2 intent toggle', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(async () => {
                const toggles = screen.getAllByRole('switch')
                const disabledToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('Cancel'),
                )
                expect(disabledToggle).toBeDefined()
                await user.hover(disabledToggle!)
            })
            await waitFor(() => {
                expect(
                    screen.getByText(
                        /Intent is disabled\. Any conversations that match this intent, will be handover to an agent\./i,
                    ),
                ).toBeInTheDocument()
            })
        })
        it('should show disabled toggle for linked L2 intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[2]
            await user.click(expandButton)
            await waitFor(() => {
                const toggles = screen.getAllByRole('switch')
                const linkedToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('Delay'),
                )
                expect(linkedToggle).toBeDisabled()
            })
        })
        it('should show enabled toggle for not_linked L2 intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                const toggles = screen.getAllByRole('switch')
                const editableToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('Status'),
                )
                expect(editableToggle).not.toBeDisabled()
            })
        })
    })
    describe('Link column', () => {
        it('should show "Link to skill" button for L2 without articles', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                const linkButtons = screen.queryAllByText('Link to skill')
                expect(linkButtons.length).toBeGreaterThan(0)
            })
        })
        it('should show linked article title for L2 with articles', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[2]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Shipping delays')).toBeInTheDocument()
            })
        })
        it('should not show link column content for L1 intents', () => {
            renderComponent()
            expect(screen.queryByText('Link to skill')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Shipping delays'),
            ).not.toBeInTheDocument()
        })
    })
    describe('Handover-only intents', () => {
        it('should show disabled toggle for handover-only intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[1]
            await user.click(expandButton)
            await waitFor(() => {
                const toggles = screen.getAllByRole('switch')
                const noReplyToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('No Reply'),
                )
                const spamToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('Spam'),
                )
                expect(noReplyToggle).toBeDisabled()
                expect(spamToggle).toBeDisabled()
            })
        })
        it('should show handover tooltip for handover-only intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[1]
            await user.click(expandButton)
            await waitFor(async () => {
                const toggles = screen.getAllByRole('switch')
                const noReplyToggle = toggles.find((toggle) =>
                    toggle.closest('tr')?.textContent?.includes('No Reply'),
                )
                if (noReplyToggle) {
                    await user.hover(noReplyToggle)
                }
            })
            await waitFor(() => {
                expect(
                    screen.getByText(/handover only and cannot be linked/i),
                ).toBeInTheDocument()
            })
        })
        it('should not show "Link to skill" button for handover-only intents', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[1]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('No Reply')).toBeInTheDocument()
                expect(screen.getByText('Spam')).toBeInTheDocument()
            })
            const noReplyRow = screen
                .getByText('No Reply')
                .closest('tr') as HTMLElement
            const spamRow = screen
                .getByText('Spam')
                .closest('tr') as HTMLElement
            expect(noReplyRow).toBeInTheDocument()
            expect(spamRow).toBeInTheDocument()
            expect(
                noReplyRow?.querySelector('button:not([aria-label])'),
            ).not.toBeInTheDocument()
            expect(
                spamRow?.querySelector('button:not([aria-label])'),
            ).not.toBeInTheDocument()
        })
    })
    describe('handleLinkToSkillConfirm', () => {
        const mockLinkToSkillModal = LinkToSkillModal as jest.Mock
        const articleWithLocale: TransformedArticle = {
            id: 42,
            title: 'Order Status Guidance',
            intents: [
                { name: 'order::cancel', formattedName: 'Order / Cancel' },
            ],
            status: 'enabled',
            publishedVersion: {
                locale: 'en-US',
                article_translation_version_id: 1,
            },
        }
        const getOnConfirm = () => {
            const { calls } = mockLinkToSkillModal.mock
            return calls[calls.length - 1][0].onConfirm as (
                intentId: string,
                article: TransformedArticle,
            ) => void
        }
        it('should call updateGuidanceArticle with merged intents and published locale', async () => {
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', articleWithLocale)
            await waitFor(() => {
                expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                    {
                        intents: ['order::cancel', 'order::status'],
                        isCurrent: false,
                    },
                    { articleId: 42, locale: 'en-US' },
                )
            })
        })
        it('should fall back to draftVersion locale when publishedVersion is absent', async () => {
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', {
                ...articleWithLocale,
                publishedVersion: undefined,
                draftVersion: {
                    locale: 'fr-FR',
                    article_translation_version_id: 2,
                },
            })
            await waitFor(() => {
                expect(mockUpdateGuidanceArticle).toHaveBeenCalledWith(
                    expect.objectContaining({ isCurrent: false }),
                    { articleId: 42, locale: 'fr-FR' },
                )
            })
        })
        it('should not call updateGuidanceArticle when article has no locale', () => {
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', {
                ...articleWithLocale,
                publishedVersion: undefined,
                draftVersion: undefined,
            })
            expect(mockUpdateGuidanceArticle).not.toHaveBeenCalled()
        })
        it('should dispatch error notification when updateGuidanceArticle rejects', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API error'))
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', articleWithLocale)
            await waitFor(() => {
                expect(JSON.stringify(__store.getActions())).toContain(
                    'An error occurred while linking the intent',
                )
            })
        })
    })
    describe('Error handling', () => {
        it('should handle missing help center ID', () => {
            mockUseAiAgentStoreConfigurationContext.mockReturnValue({
                storeConfiguration: {
                    guidanceHelpCenterId: null,
                },
            })
            mockUseIntentsTable.mockReturnValue({
                intents: [],
                isLoading: false,
                isError: false,
            })
            renderComponent()
            expect(screen.getByText('Showing 0 of 0 items')).toBeInTheDocument()
        })
    })
    describe('Metric columns', () => {
        const mockUseGetCustomTicketsFieldsDefinitionData = jest.requireMock(
            'pages/aiAgent/insights/IntentTableWidget/hooks/useGetCustomTicketsFieldsDefinitionData',
        ).useGetCustomTicketsFieldsDefinitionData as jest.Mock
        const mockMetricCell = MetricCell as jest.Mock
        const intentsWithMetrics: TransformedIntent[] = [
            {
                id: 'order',
                name: 'order',
                formattedName: 'Order',
                toggleState: 'enabled',
                status: IntentStatus.NotLinked,
                metrics: {
                    ticketVolume: 100,
                    ticketVolumePercent: 50,
                    handoverCount: 20,
                    handoverPercent: 20,
                },
                children: [
                    {
                        id: 'order::status',
                        name: 'order::status',
                        formattedName: 'Status',
                        toggleState: 'enabled',
                        status: IntentStatus.NotLinked,
                        parentId: 'order',
                        articles: [],
                        metrics: {
                            ticketVolume: 100,
                            ticketVolumePercent: 50,
                            handoverCount: 20,
                            handoverPercent: 20,
                        },
                    },
                ],
            },
        ]
        it('should show skeleton when metrics are loading', async () => {
            const user = userEvent.setup()
            mockUseIntentsTable.mockReturnValue({
                intents: mockIntents,
                isLoading: false,
                isMetricsLoading: true,
                isError: false,
            })
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                const skeletons = screen.getAllByLabelText('Loading')
                expect(skeletons.length).toBeGreaterThan(0)
            })
        })
        it('should show -- when intent has no metrics', () => {
            mockUseIntentsTable.mockReturnValue({
                intents: mockIntents,
                isLoading: false,
                isMetricsLoading: false,
                isError: false,
            })
            renderComponent()
            const dashCells = screen.getAllByText('--')
            expect(dashCells.length).toBeGreaterThan(0)
        })
        it('should show plain text metric value when custom field IDs are missing', async () => {
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithMetrics,
                isLoading: false,
                isMetricsLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })
            renderComponent()
            await waitFor(() => {
                expect(screen.getByText('Order')).toBeInTheDocument()
            })
            expect(mockMetricCell).not.toHaveBeenCalled()
            expect(screen.getByText('50%')).toBeInTheDocument()
        })
        it('should render MetricCell when metrics, dateRange and custom field IDs are available', async () => {
            mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
                outcomeCustomFieldId: 10,
                intentCustomFieldId: 20,
                sentimentCustomFieldId: null,
                isLoading: false,
            })
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithMetrics,
                isLoading: false,
                isMetricsLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })
            renderComponent()
            await waitFor(() => {
                expect(screen.getByText('Order')).toBeInTheDocument()
            })
            expect(mockMetricCell).toHaveBeenCalled()
        })
        it('should show -- when ticket volume is 0', async () => {
            mockUseGetCustomTicketsFieldsDefinitionData.mockReturnValue({
                outcomeCustomFieldId: 10,
                intentCustomFieldId: 20,
                sentimentCustomFieldId: null,
                isLoading: false,
            })
            const intentsWithZeroVolume: TransformedIntent[] = [
                {
                    id: 'order',
                    name: 'order',
                    formattedName: 'Order',
                    toggleState: 'enabled',
                    status: IntentStatus.NotLinked,
                    metrics: {
                        ticketVolume: 0,
                        ticketVolumePercent: 0,
                        handoverCount: 0,
                        handoverPercent: 0,
                    },
                    children: [],
                },
            ]
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithZeroVolume,
                isLoading: false,
                isMetricsLoading: false,
                isError: false,
                metricsDateRange: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-28',
                },
            })
            renderComponent()
            await waitFor(() => {
                expect(screen.getByText('Order')).toBeInTheDocument()
            })
            const dashCells = screen.getAllByText('--')
            expect(dashCells.length).toBeGreaterThan(0)
        })
    })
    describe('Toggle enabled — ON to OFF (disable confirmation modal)', () => {
        it('should open DisableIntentModal when toggle is turned off', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const statusRow = screen
                .getByText('Status')
                .closest('tr') as HTMLElement
            const toggle = statusRow.querySelector(
                '[role="switch"]',
            ) as HTMLElement
            await user.click(toggle)
            await waitFor(() => {
                expect(screen.getByText('Disable intent?')).toBeInTheDocument()
            })
        })
        it('should call updateIntentStatus with handover status when Disable is confirmed', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const statusRow = screen
                .getByText('Status')
                .closest('tr') as HTMLElement
            const toggle = statusRow.querySelector(
                '[role="switch"]',
            ) as HTMLElement
            await user.click(toggle)
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /disable/i }),
                ).toBeInTheDocument()
            })
            await user.click(screen.getByRole('button', { name: /disable/i }))
            await waitFor(() => {
                expect(mockUpdateIntentStatus).toHaveBeenCalledWith(
                    'order::status',
                    'handover',
                )
            })
        })
        it('should close the modal without calling updateIntentStatus when Cancel is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const statusRow = screen
                .getByText('Status')
                .closest('tr') as HTMLElement
            const toggle = statusRow.querySelector(
                '[role="switch"]',
            ) as HTMLElement
            await user.click(toggle)
            await waitFor(() => {
                expect(
                    screen.getByRole('button', { name: /cancel/i }),
                ).toBeInTheDocument()
            })
            await user.click(screen.getByRole('button', { name: /cancel/i }))
            await waitFor(() => {
                expect(
                    screen.queryByText('Disable intent?'),
                ).not.toBeInTheDocument()
            })
            expect(mockUpdateIntentStatus).not.toHaveBeenCalled()
        })
    })
    describe('Toggle enabled — OFF to ON (enable directly)', () => {
        it('should call updateIntentStatus with not_linked status when a disabled intent is enabled', async () => {
            const user = userEvent.setup()
            const intentsWithDisabled: TransformedIntent[] = [
                {
                    id: 'order',
                    name: 'order',
                    formattedName: 'Order',
                    toggleState: 'disabled',
                    status: IntentStatus.NotLinked,
                    children: [
                        {
                            id: 'order::cancel',
                            name: 'order::cancel',
                            formattedName: 'Cancel',
                            toggleState: 'disabled',
                            status: IntentStatus.Handover,
                            parentId: 'order',
                            articles: [],
                        },
                    ],
                },
            ]
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithDisabled,
                findIntent: createFindIntent(intentsWithDisabled),
                isLoading: false,
                isError: false,
            })
            renderComponent()
            const expandButton = screen.getByRole('button', { name: /expand/i })
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Cancel')).toBeInTheDocument()
            })
            const cancelRow = screen
                .getByText('Cancel')
                .closest('tr') as HTMLElement
            const toggle = cancelRow.querySelector(
                '[role="switch"]',
            ) as HTMLElement
            await user.click(toggle)
            await waitFor(() => {
                expect(mockUpdateIntentStatus).toHaveBeenCalledWith(
                    'order::cancel',
                    'not_linked',
                )
            })
        })
        it('should not open the disable modal when enabling an intent', async () => {
            const user = userEvent.setup()
            const intentsWithDisabled: TransformedIntent[] = [
                {
                    id: 'order',
                    name: 'order',
                    formattedName: 'Order',
                    toggleState: 'disabled',
                    status: IntentStatus.NotLinked,
                    children: [
                        {
                            id: 'order::cancel',
                            name: 'order::cancel',
                            formattedName: 'Cancel',
                            toggleState: 'disabled',
                            status: IntentStatus.Handover,
                            parentId: 'order',
                            articles: [],
                        },
                    ],
                },
            ]
            mockUseIntentsTable.mockReturnValue({
                intents: intentsWithDisabled,
                findIntent: createFindIntent(intentsWithDisabled),
                isLoading: false,
                isError: false,
            })
            renderComponent()
            const expandButton = screen.getByRole('button', { name: /expand/i })
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Cancel')).toBeInTheDocument()
            })
            const cancelRow = screen
                .getByText('Cancel')
                .closest('tr') as HTMLElement
            const toggle = cancelRow.querySelector(
                '[role="switch"]',
            ) as HTMLElement
            await user.click(toggle)
            expect(
                screen.queryByText('Disable intent?'),
            ).not.toBeInTheDocument()
        })
    })
    describe('handleOpenSkill — clicking a linked article', () => {
        it('should navigate to the skill editor for the linked article', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[2]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Shipping delays')).toBeInTheDocument()
            })
            await user.click(screen.getByText('Shipping delays'))
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/skills/1',
            )
        })
    })
    describe('handleCreateNewSkill — selecting "New skill" from dropdown', () => {
        it('should navigate to skill editor with intent name and description as route state', async () => {
            const user = userEvent.setup()
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const linkButtons = screen.getAllByRole('button', {
                name: /link to skill/i,
            })
            await user.click(linkButtons[0])
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /new skill/i }),
                ).toBeInTheDocument()
            })
            await user.click(screen.getByRole('option', { name: /new skill/i }))
            expect(mockPush).toHaveBeenCalledWith(
                '/app/ai-agent/shopify/test-shop/skills/new',
                {
                    title: 'Requests to cancel an order',
                    intents: ['order::cancel'],
                },
            )
        })
    })
    describe('handleLinkToSkillConfirm — redirect after successful link', () => {
        const mockLinkToSkillModal = LinkToSkillModal as jest.Mock
        const articleWithLocale: TransformedArticle = {
            id: 42,
            title: 'Order Status Guidance',
            intents: [
                { name: 'order::cancel', formattedName: 'Order / Cancel' },
            ],
            status: 'enabled',
            publishedVersion: {
                locale: 'en-US',
                article_translation_version_id: 1,
            },
        }
        const getOnConfirm = () => {
            const { calls } = mockLinkToSkillModal.mock
            return calls[calls.length - 1][0].onConfirm as (
                intentId: string,
                article: TransformedArticle,
            ) => void
        }
        it('should redirect to the skill editor after a successful link', async () => {
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', articleWithLocale)
            await waitFor(() => {
                expect(mockPush).toHaveBeenCalledWith(
                    '/app/ai-agent/shopify/test-shop/skills/42',
                )
            })
        })
        it('should not redirect when the link fails', async () => {
            mockUpdateGuidanceArticle.mockRejectedValue(new Error('API error'))
            renderComponent()
            const onConfirm = getOnConfirm()
            onConfirm('order::status', articleWithLocale)
            await waitFor(() => {
                expect(JSON.stringify(__store.getActions())).toContain(
                    'An error occurred while linking the intent',
                )
            })
            expect(mockPush).not.toHaveBeenCalled()
        })
    })
    describe('"Existing skill" disabled state', () => {
        it('should disable "Existing skill" option when there are no existing skills', async () => {
            const user = userEvent.setup()
            mockUseSkillsArticles.mockReturnValue({
                articles: [],
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                metricsDateRange: undefined,
            })
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const linkButtons = screen.getAllByRole('button', {
                name: /link to skill/i,
            })
            await user.click(linkButtons[0])
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /existing skill/i }),
                ).toBeInTheDocument()
            })
            expect(
                screen.getByRole('option', { name: /existing skill/i }),
            ).toHaveAttribute('aria-disabled', 'true')
        })
        it('should enable "Existing skill" option when there are existing skills', async () => {
            const user = userEvent.setup()
            mockUseSkillsArticles.mockReturnValue({
                articles: [
                    {
                        id: 1,
                        title: 'Some Skill',
                        intents: [],
                        status: 'enabled',
                    },
                ],
                isLoading: false,
                isError: false,
                isMetricsLoading: false,
                metricsDateRange: undefined,
            })
            renderComponent()
            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[0]
            await user.click(expandButton)
            await waitFor(() => {
                expect(screen.getByText('Status')).toBeInTheDocument()
            })
            const linkButtons = screen.getAllByRole('button', {
                name: /link to skill/i,
            })
            await user.click(linkButtons[0])
            await waitFor(() => {
                expect(
                    screen.getByRole('option', { name: /existing skill/i }),
                ).toBeInTheDocument()
            })
            expect(
                screen.getByRole('option', { name: /existing skill/i }),
            ).not.toHaveAttribute('aria-disabled', 'true')
        })
    })
})

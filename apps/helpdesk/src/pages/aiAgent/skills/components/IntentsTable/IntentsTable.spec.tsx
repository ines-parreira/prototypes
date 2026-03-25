import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { ThemeProvider } from 'core/theme'
import { useAiAgentStoreConfigurationContext } from 'pages/aiAgent/providers/AiAgentStoreConfigurationContext'

import { IntentStatus } from '../../types'
import { IntentsTable } from './IntentsTable'
import type { TransformedIntent } from './useIntentsTable'
import { useIntentsTable } from './useIntentsTable'

jest.mock('./useIntentsTable')
jest.mock('pages/aiAgent/providers/AiAgentStoreConfigurationContext')

const mockUseIntentsTable = useIntentsTable as jest.Mock
const mockUseAiAgentStoreConfigurationContext =
    useAiAgentStoreConfigurationContext as jest.Mock

const mockStore = configureMockStore([thunk])

Element.prototype.getAnimations = jest.fn(() => [])

describe('IntentsTable', () => {
    let store: ReturnType<typeof mockStore>

    const mockIntents: TransformedIntent[] = [
        {
            id: 'order',
            name: 'order',
            formattedName: 'Order',
            toggleState: 'indeterminate',
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

        store = mockStore({})

        mockUseAiAgentStoreConfigurationContext.mockReturnValue({
            storeConfiguration: {
                guidanceHelpCenterId: 123,
            },
        })

        mockUseIntentsTable.mockReturnValue({
            intents: mockIntents,
            isLoading: false,
            isError: false,
        })
    })

    const renderComponent = (props = {}) => {
        return render(
            <Provider store={store}>
                <ThemeProvider>
                    <IntentsTable
                        isOpen={true}
                        onOpenChange={jest.fn()}
                        {...props}
                    />
                </ThemeProvider>
            </Provider>,
        )
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
                    screen.getByText(/L1 intents are not linkable/i),
                ).toBeInTheDocument()
            })
        })

        it('should show disabled toggle for linked L2 intents', async () => {
            const user = userEvent.setup()
            renderComponent()

            const expandButton = screen.getAllByRole('button', {
                name: /expand/i,
            })[1]
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
            })[1]
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
            })[2]
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
            })[2]
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
            })[2]
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
})

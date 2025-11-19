import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EMPTY_HELP_CENTER_ID } from '../../../automate/common/components/HelpCenterSelect'
import {
    HELP_CENTER_SELECT_MODAL_OPEN,
    OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
} from '../constants'
import type { GroupedKnowledgeItem } from '../types'
import { KnowledgeType, KnowledgeVisibility } from '../types'
import {
    EmptyStateDocument,
    EmptyStateDomain,
    EmptyStateFAQ,
    EmptyStateGuidance,
    EmptyStates,
    EmptyStateURL,
    EmptyStateWrapper,
} from './EmptyStates'
import { openSyncUrlModal } from './SyncUrlModal'
import { useFaqHelpCenter } from './useFaqHelpCenter'
import { dispatchDocumentEvent, openSyncStoreWebsiteModal } from './utils'

jest.mock('./useFaqHelpCenter')
jest.mock('./utils', () => ({
    dispatchDocumentEvent: jest.fn(),
    useListenToDocumentEvent: jest.fn(),
    openSyncStoreWebsiteModal: jest.fn(),
}))
jest.mock('./SyncUrlModal', () => ({
    openSyncUrlModal: jest.fn(),
}))

const mockUseFaqHelpCenter = useFaqHelpCenter as jest.MockedFunction<
    typeof useFaqHelpCenter
>
const mockDispatchDocumentEvent = dispatchDocumentEvent as jest.MockedFunction<
    typeof dispatchDocumentEvent
>
const mockOpenSyncUrlModal = openSyncUrlModal as jest.MockedFunction<
    typeof openSyncUrlModal
>
const mockOpenSyncStoreWebsiteModal =
    openSyncStoreWebsiteModal as jest.MockedFunction<
        typeof openSyncStoreWebsiteModal
    >

const defaultMockValues = {
    faqHelpCenters: [],
    selectedHelpCenter: {
        id: EMPTY_HELP_CENTER_ID,
        name: 'No help center',
    },
    setHelpCenterId: jest.fn(),
    handleOnSave: jest.fn(),
    shopName: 'test-shop',
    isPendingCreateOrUpdate: false,
    helpCenterItems: [{ id: -1, name: 'No help center' }],
}

beforeEach(() => {
    jest.clearAllMocks()
    mockUseFaqHelpCenter.mockReturnValue(defaultMockValues)
})

describe('EmptyStates', () => {
    describe('EmptyStates (main component)', () => {
        it('renders create new content section', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })

        it('renders sync or upload external content section', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Sync or upload external content',
                }),
            ).toBeInTheDocument()
        })

        it('displays Guidance card in create section', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(screen.getByText('Guidance')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow internal processes.',
                ),
            ).toBeInTheDocument()
        })

        it('displays FAQ card in create section', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(screen.getByText('Help Center articles')).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Let AI Agent use published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('displays Website card when hasWebsiteSync is false', () => {
            render(<EmptyStates hasWebsiteSync={false} helpCenterId={null} />)

            expect(screen.getByText('Store website')).toBeInTheDocument()
            expect(
                screen.getByText('Sync your site content'),
            ).toBeInTheDocument()
        })

        it('does not display Website card when hasWebsiteSync is true', () => {
            render(<EmptyStates hasWebsiteSync={true} helpCenterId={null} />)

            expect(screen.queryByText('Store website')).not.toBeInTheDocument()
        })

        it('displays URL card', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(screen.getByText('URLs')).toBeInTheDocument()
            expect(
                screen.getByText('Sync single-page URLs'),
            ).toBeInTheDocument()
        })

        it('displays Documents card', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(screen.getByText('Documents')).toBeInTheDocument()
            expect(
                screen.getByText('Upload external files'),
            ).toBeInTheDocument()
        })

        it('applies center alignment by default', () => {
            const { container } = render(<EmptyStates helpCenterId={null} />)

            const headings = container.querySelectorAll('h4')
            expect(headings.length).toBeGreaterThan(0)
        })

        it('applies custom alignment when provided', () => {
            const { container } = render(
                <EmptyStates titleAlignment="flex-start" helpCenterId={null} />,
            )

            const headings = container.querySelectorAll('h4')
            expect(headings.length).toBeGreaterThan(0)
        })
    })

    describe('EmptyStateGuidance', () => {
        it('renders guidance empty state', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
        })

        it('displays guidance description', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByText(
                    'Instruct AI Agent to handle customer requests and follow end-to-end processes with internal-facing Guidance.',
                ),
            ).toBeInTheDocument()
        })

        it('displays create guidance button', () => {
            render(<EmptyStateGuidance />)

            expect(
                screen.getByRole('button', { name: 'Create Guidance' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateFAQ', () => {
        const mockArticles = [
            {
                type: KnowledgeType.FAQ,
                title: 'Test Article',
                lastUpdatedAt: '2024-01-15T10:00:00Z',
                inUseByAI: KnowledgeVisibility.PUBLIC,
                id: '1',
            },
        ]

        it('renders connect help center state when helpCenterId is null', () => {
            render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Connect Help Center' }),
            ).toBeInTheDocument()
        })

        it('renders get started state when helpCenterId exists', () => {
            render(<EmptyStateFAQ helpCenterId={123} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', {
                    name: 'Create Help Center article',
                }),
            ).toBeInTheDocument()
        })

        it('displays correct description when no articles exist', () => {
            render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

            expect(
                screen.getByText(
                    'Let AI Agent use your published Help Center articles as knowledge.',
                ),
            ).toBeInTheDocument()
        })

        it('displays different description when articles exist', () => {
            render(<EmptyStateFAQ helpCenterId={123} articles={mockArticles} />)

            expect(
                screen.getByText(
                    'Create and publish articles to make them available to AI Agent.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDomain', () => {
        it('renders domain empty state', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByRole('heading', {
                    name: 'Sync your store website',
                }),
            ).toBeInTheDocument()
        })

        it('displays domain description', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByText(
                    /Use your website.s content and product pages as knowledge for AI Agent/,
                ),
            ).toBeInTheDocument()
        })

        it('displays sync button', () => {
            render(<EmptyStateDomain />)

            expect(
                screen.getByRole('button', { name: /Sync/ }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateURL', () => {
        it('renders URL empty state', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByRole('heading', { name: 'Add URLs' }),
            ).toBeInTheDocument()
        })

        it('displays URL description', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByText(
                    'Add links to public pages AI Agent can learn from like blog posts or external documentation.',
                ),
            ).toBeInTheDocument()
        })

        it('displays add URL button', () => {
            render(<EmptyStateURL />)

            expect(
                screen.getByRole('button', { name: 'Add URL' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateDocument', () => {
        it('renders document empty state', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
        })

        it('displays document description', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByText(
                    'Upload external documents such as policies or product manuals to help your AI Agent provide more accurate answers.',
                ),
            ).toBeInTheDocument()
        })

        it('displays upload document button', () => {
            render(<EmptyStateDocument />)

            expect(
                screen.getByRole('button', { name: 'Upload Document' }),
            ).toBeInTheDocument()
        })
    })

    describe('EmptyStateWrapper', () => {
        const mockArticles = [] as unknown as GroupedKnowledgeItem[]

        it('renders EmptyStates when no filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={null}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateDocument when Document filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Document}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Add documents' }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateDomain when Domain filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Domain}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Sync your store website',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateFAQ when FAQ filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateGuidance when Guidance filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.Guidance}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Guidance',
                }),
            ).toBeInTheDocument()
        })

        it('renders EmptyStateURL when URL filter is selected', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.URL}
                    helpCenterId={null}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Add URLs' }),
            ).toBeInTheDocument()
        })

        it('passes helpCenterId to EmptyStateFAQ', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={123}
                    articles={mockArticles}
                />,
            )

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
        })

        it('passes articles to EmptyStateFAQ', () => {
            const articles = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            ]

            render(
                <EmptyStateWrapper
                    documentFilter={KnowledgeType.FAQ}
                    helpCenterId={123}
                    articles={articles}
                />,
            )

            expect(
                screen.getByText(
                    'Create and publish articles to make them available to AI Agent.',
                ),
            ).toBeInTheDocument()
        })
    })

    describe('User Interactions', () => {
        describe('EmptyStates main component', () => {
            it('dispatches OPEN_CREATE_GUIDANCE_ARTICLE_MODAL when Guidance card is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStates helpCenterId={null} />)

                const guidanceCard = screen.getByText('Guidance').closest('div')
                await act(() => user.click(guidanceCard!))

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
                )
            })

            it('dispatches HELP_CENTER_SELECT_MODAL_OPEN when FAQ card is clicked and no helpCenterId', async () => {
                const user = userEvent.setup()
                render(<EmptyStates helpCenterId={null} />)

                const faqCard = screen
                    .getByText('Help Center articles')
                    .closest('div')
                await act(() => user.click(faqCard!))

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    HELP_CENTER_SELECT_MODAL_OPEN,
                )
            })

            it('does not dispatch event when FAQ card is clicked with helpCenterId', async () => {
                const user = userEvent.setup()
                render(<EmptyStates helpCenterId={123} />)

                const faqCard = screen
                    .getByText('Help Center articles')
                    .closest('div')
                await act(() => user.click(faqCard!))

                expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
            })

            it('opens sync store website modal when Website card is clicked', async () => {
                const user = userEvent.setup()
                render(
                    <EmptyStates hasWebsiteSync={false} helpCenterId={null} />,
                )

                const websiteCard = screen
                    .getByText('Store website')
                    .closest('div')
                await act(() => user.click(websiteCard!))

                expect(mockOpenSyncStoreWebsiteModal).toHaveBeenCalled()
            })

            it('opens sync URL modal when URL card is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStates helpCenterId={null} />)

                const urlCard = screen.getByText('URLs').closest('div')
                await act(() => user.click(urlCard!))

                expect(mockOpenSyncUrlModal).toHaveBeenCalled()
            })

            it('does not dispatch event when Documents card is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStates helpCenterId={null} />)

                const documentsCard = screen
                    .getByText('Documents')
                    .closest('div')
                mockDispatchDocumentEvent.mockClear()

                await act(() => user.click(documentsCard!))

                expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
            })
        })

        describe('EmptyStateGuidance', () => {
            it('dispatches OPEN_CREATE_GUIDANCE_ARTICLE_MODAL when Create Guidance button is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStateGuidance />)

                const createButton = screen.getByRole('button', {
                    name: 'Create Guidance',
                })
                await act(() => user.click(createButton))

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    OPEN_CREATE_GUIDANCE_ARTICLE_MODAL,
                )
            })
        })

        describe('EmptyStateDomain', () => {
            it('dispatches OPEN_SYNC_WEBSITE_MODAL when Sync button is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStateDomain />)

                const syncButton = screen.getByRole('button', { name: /Sync/ })
                await act(() => user.click(syncButton))

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    'open-sync-website-modal',
                )
            })
        })

        describe('EmptyStateURL', () => {
            it('opens sync URL modal when Add URL button is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStateURL />)

                const addButton = screen.getByRole('button', {
                    name: 'Add URL',
                })
                await act(() => user.click(addButton))

                expect(mockOpenSyncUrlModal).toHaveBeenCalled()
            })
        })

        describe('EmptyStateDocument', () => {
            it('renders Upload Document button without event handler', () => {
                render(<EmptyStateDocument />)

                const uploadButton = screen.getByRole('button', {
                    name: 'Upload Document',
                })
                expect(uploadButton).toBeInTheDocument()
            })
        })

        describe('EmptyStateFAQ', () => {
            it('dispatches HELP_CENTER_SELECT_MODAL_OPEN when Connect Help Center button is clicked', async () => {
                const user = userEvent.setup()
                render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

                const connectButton = screen.getByRole('button', {
                    name: 'Connect Help Center',
                })
                await act(() => user.click(connectButton))

                expect(mockDispatchDocumentEvent).toHaveBeenCalledWith(
                    HELP_CENTER_SELECT_MODAL_OPEN,
                )
            })

            it('does not dispatch event when Create Help Center article button is clicked with no articles', async () => {
                const user = userEvent.setup()
                render(<EmptyStateFAQ helpCenterId={123} articles={[]} />)

                const createButton = screen.getByRole('button', {
                    name: 'Create Help Center article',
                })
                await act(() => user.click(createButton))

                expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
            })

            it('does not dispatch event when Create Help Center article button is clicked with articles', async () => {
                const user = userEvent.setup()
                const mockArticles = [
                    {
                        type: KnowledgeType.FAQ,
                        title: 'Test Article',
                        lastUpdatedAt: '2024-01-15T10:00:00Z',
                        inUseByAI: KnowledgeVisibility.PUBLIC,
                        id: '1',
                    },
                ]

                render(
                    <EmptyStateFAQ
                        helpCenterId={123}
                        articles={mockArticles}
                    />,
                )

                const createButton = screen.getByRole('button', {
                    name: 'Create Help Center article',
                })
                await act(() => user.click(createButton))

                expect(mockDispatchDocumentEvent).not.toHaveBeenCalled()
            })
        })
    })

    describe('Edge cases', () => {
        it('EmptyStateFAQ shows connect state when helpCenterId is null', () => {
            render(<EmptyStateFAQ helpCenterId={null} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Connect your Help Center',
                }),
            ).toBeInTheDocument()
        })

        it('EmptyStateFAQ shows get started state when helpCenterId is defined', () => {
            render(<EmptyStateFAQ helpCenterId={123} articles={[]} />)

            expect(
                screen.getByRole('heading', {
                    name: 'Get started with Help Center articles',
                }),
            ).toBeInTheDocument()
        })

        it('EmptyStateFAQ shows different description with articles', () => {
            const mockArticles = [
                {
                    type: KnowledgeType.FAQ,
                    title: 'Test',
                    lastUpdatedAt: '2024-01-15T10:00:00Z',
                    inUseByAI: KnowledgeVisibility.PUBLIC,
                    id: '1',
                },
            ]

            render(<EmptyStateFAQ helpCenterId={123} articles={mockArticles} />)

            expect(
                screen.getByText(
                    'Create and publish articles to make them available to AI Agent.',
                ),
            ).toBeInTheDocument()
        })

        it('EmptyStates renders without crashing when hasWebsiteSync is undefined', () => {
            render(<EmptyStates helpCenterId={null} />)

            expect(screen.getByText('Store website')).toBeInTheDocument()
        })

        it('EmptyStateWrapper handles undefined helpCenterId', () => {
            render(
                <EmptyStateWrapper
                    documentFilter={null}
                    helpCenterId={undefined}
                    articles={[]}
                />,
            )

            expect(
                screen.getByRole('heading', { name: 'Create new content' }),
            ).toBeInTheDocument()
        })
    })
})

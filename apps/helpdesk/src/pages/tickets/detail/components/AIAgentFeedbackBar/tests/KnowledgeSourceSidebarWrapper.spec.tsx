import type React from 'react'

import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'
import { useUpsertFeedback } from 'models/knowledgeService/mutations'
import { useGetFeedback } from 'models/knowledgeService/queries'
import { useStoreConfiguration } from 'pages/aiAgent/hooks/useStoreConfiguration'
import { useFeedbackActions } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions'
import { useFeedbackTracking } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking'
import { useKnowledgeSourceSideBar } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { getCurrentAccountState } from 'state/currentAccount/selectors'
import { getTicketState } from 'state/ticket/selectors'

import KnowledgeSourceSideBar from '../KnowledgeSourceSideBar'
import KnowledgeSourceSidebarWrapper from '../KnowledgeSourceSidebarWrapper'
import { AiAgentKnowledgeResourceTypeEnum } from '../types'
import { useGetAllRelatedResourceData } from '../useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData'

jest.mock('../KnowledgeSourceSideBar')
const KnowledgeSourceSideBarMock = assumeMock(KnowledgeSourceSideBar)

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

jest.mock('models/knowledgeService/mutations')
const useUpsertFeedbackMock = useUpsertFeedback as jest.Mock

jest.mock('models/knowledgeService/queries')
const useGetFeedbackMock = useGetFeedback as jest.Mock

jest.mock('pages/aiAgent/hooks/useStoreConfiguration')
const useStoreConfigurationMock = useStoreConfiguration as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackActions',
)
const useFeedbackActionsMock = useFeedbackActions as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useFeedbackTracking',
)
const useFeedbackTrackingMock = useFeedbackTracking as jest.Mock

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar',
)
const useKnowledgeSourceSideBarMock = assumeMock(useKnowledgeSourceSideBar)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/useEnrichKnowledgeFeedbackData/useGetAllRelatedResourceData',
)
const useGetAllRelatedResourceDataMock =
    useGetAllRelatedResourceData as jest.Mock

jest.mock('pages/settings/helpCenter/providers/SupportedLocales', () => ({
    SupportedLocalesProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="supported-locales-provider">{children}</div>
    ),
}))

jest.mock(
    'pages/settings/helpCenter/contexts/CurrentHelpCenterContext',
    () => ({
        __esModule: true,
        default: {
            Provider: ({
                children,
                value,
            }: {
                children: React.ReactNode
                value: any
            }) => (
                <div
                    data-testid="help-center-context"
                    data-value={JSON.stringify(value)}
                >
                    {children}
                </div>
            ),
        },
    }),
)

jest.mock(
    'pages/tickets/detail/components/AIAgentFeedbackBar/UnsavedChangesModalProvider',
    () => ({
        UnsavedChangesModalProvider: ({
            children,
        }: {
            children: React.ReactNode
        }) => (
            <div data-testid="unsaved-changes-modal-provider">{children}</div>
        ),
    }),
)

jest.mock('pages/settings/helpCenter/providers/EditionManagerContext', () => ({
    EditionManagerContextProvider: ({
        children,
    }: {
        children: React.ReactNode
    }) => <div data-testid="edition-manager-context-provider">{children}</div>,
}))

const MOCK_FEEDBACK_DATA = {
    executions: [
        {
            id: 123,
            storeConfiguration: {
                shopName: 'Test Shop',
                shopType: 'shopify',
                helpCenterId: 456,
                guidanceHelpCenterId: 789,
            },
            resources: [],
            feedback: [],
        },
    ],
}

const MOCK_HELP_CENTER = {
    id: 456,
    name: 'Test Help Center',
    supported_locales: ['en-US', 'en-GB'],
    default_locale: 'en-US',
}

const MOCK_RELATED_RESOURCE_DATA = {
    actions: [],
    articles: [],
    guidanceArticles: [],
    sourceItems: [],
    ingestedFiles: [],
    storeWebsiteQuestions: [],
    helpCenters: [MOCK_HELP_CENTER],
}

describe('KnowledgeSourceSidebarWrapper', () => {
    const defaultMockSetup = () => {
        KnowledgeSourceSideBarMock.mockReturnValue(
            <div data-testid="knowledge-source-sidebar">
                KnowledgeSourceSideBar
            </div>,
        )

        useAppSelectorMock.mockImplementation((selector) => {
            if (selector === getTicketState) return new Map([['id', 123]])
            if (selector === getCurrentAccountState)
                return new Map([
                    ['id', 1],
                    ['domain', 'test.com'],
                ] as any)
            if (selector.toString().includes('state.currentUser'))
                return new Map([['id', 789]])
            return null
        })

        useGetFeedbackMock.mockReturnValue({
            data: MOCK_FEEDBACK_DATA,
        })

        useStoreConfigurationMock.mockReturnValue({
            storeConfiguration: {
                shopName: 'Test Shop',
                shopType: 'shopify',
                helpCenterId: 456,
                guidanceHelpCenterId: 789,
            },
        })

        useGetAllRelatedResourceDataMock.mockReturnValue(
            MOCK_RELATED_RESOURCE_DATA,
        )

        useKnowledgeSourceSideBarMock.mockReturnValue({
            selectedResource: {
                knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                id: '123',
                url: 'https://example.com',
                title: 'Test Article',
                content: 'Test content',
            },
            mode: null,
            isClosing: false,
            openPreview: jest.fn(),
            openEdit: jest.fn(),
            openCreate: jest.fn(),
            closeModal: jest.fn(),
        })

        useFeedbackTrackingMock.mockReturnValue({
            onKnowledgeResourceEditClick: jest.fn(),
            onKnowledgeResourceCreateClick: jest.fn(),
            onKnowledgeResourceSaved: jest.fn(),
        })

        useUpsertFeedbackMock.mockReturnValue({
            mutateAsync: jest.fn(),
        })

        useFeedbackActionsMock.mockReturnValue({
            onSubmitNewMissingKnowledge: jest.fn(),
        })
    }

    beforeEach(() => {
        defaultMockSetup()
    })

    describe('when all conditions are met', () => {
        it('should render KnowledgeSourceSideBar with correct props', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.getByTestId('knowledge-source-sidebar'),
            ).toBeInTheDocument()
            expect(KnowledgeSourceSideBarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    articles: [],
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    onSubmitNewMissingKnowledge: expect.any(Function),
                    onKnowledgeResourceEditClick: expect.any(Function),
                    onKnowledgeResourceSaved: expect.any(Function),
                }),
                {},
            )
        })

        it('should wrap KnowledgeSourceSideBar with all necessary context providers', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.getByTestId('supported-locales-provider'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('help-center-context'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('unsaved-changes-modal-provider'),
            ).toBeInTheDocument()
            expect(
                screen.getByTestId('edition-manager-context-provider'),
            ).toBeInTheDocument()
        })

        it('should provide correct helpCenter to CurrentHelpCenterContext', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            const helpCenterContext = screen.getByTestId('help-center-context')
            const contextValue = JSON.parse(
                helpCenterContext.getAttribute('data-value') || '{}',
            )
            expect(contextValue).toEqual(MOCK_HELP_CENTER)
        })
    })

    describe('early returns', () => {
        it('should return null when shopName is empty', () => {
            useGetFeedbackMock.mockReturnValue({
                data: {
                    executions: [
                        {
                            id: 123,
                            storeConfiguration: {
                                shopName: '',
                            },
                        },
                    ],
                },
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })

        it('should return null when feedback has no executions', () => {
            useGetFeedbackMock.mockReturnValue({
                data: { executions: [] },
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })

        it('should return null when feedback is null', () => {
            useGetFeedbackMock.mockReturnValue({
                data: null,
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })

        it('should return null when helpCenter is not found', () => {
            useGetAllRelatedResourceDataMock.mockReturnValue({
                ...MOCK_RELATED_RESOURCE_DATA,
                helpCenters: [],
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })

        it('should return null when selectedResource is null', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: null,
                mode: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })
    })

    describe('helpCenter selection logic', () => {
        it('should use selectedResource helpCenterId when available', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: {
                    knowledgeResourceType:
                        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    helpCenterId: '456',
                    id: '123',
                    url: 'https://example.com',
                    title: 'Test Article',
                    content: 'Test content',
                },
                mode: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(<KnowledgeSourceSidebarWrapper />)

            const helpCenterContext = screen.getByTestId('help-center-context')
            const contextValue = JSON.parse(
                helpCenterContext.getAttribute('data-value') || '{}',
            )
            expect(contextValue).toEqual(MOCK_HELP_CENTER)
        })

        it('should fall back to storeConfiguration helpCenterId when selectedResource has no helpCenterId', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: {
                    knowledgeResourceType:
                        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    id: '123',
                    url: 'https://example.com',
                    title: 'Test Article',
                    content: 'Test content',
                },
                mode: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(<KnowledgeSourceSidebarWrapper />)

            const helpCenterContext = screen.getByTestId('help-center-context')
            const contextValue = JSON.parse(
                helpCenterContext.getAttribute('data-value') || '{}',
            )
            expect(contextValue).toEqual(MOCK_HELP_CENTER)
        })

        it('should fall back to storeConfiguration helpCenterId when selectedResource has no helpCenterId', () => {
            useKnowledgeSourceSideBarMock.mockReturnValue({
                selectedResource: {
                    knowledgeResourceType:
                        AiAgentKnowledgeResourceTypeEnum.ARTICLE,
                    // No helpCenterId field - should fall back to storeConfiguration
                    id: '123',
                    url: 'https://example.com',
                    title: 'Test Article',
                    content: 'Test content',
                },
                mode: null,
                isClosing: false,
                openPreview: jest.fn(),
                openEdit: jest.fn(),
                openCreate: jest.fn(),
                closeModal: jest.fn(),
            })

            render(<KnowledgeSourceSidebarWrapper />)

            const helpCenterContext = screen.getByTestId('help-center-context')
            const contextValue = JSON.parse(
                helpCenterContext.getAttribute('data-value') || '{}',
            )
            expect(contextValue).toEqual(MOCK_HELP_CENTER)
        })
    })

    describe('article data handling', () => {
        it('should pass articles from related resource data', () => {
            const articles = [{ id: 1, title: 'Resource Article' }]

            useGetAllRelatedResourceDataMock.mockReturnValue({
                ...MOCK_RELATED_RESOURCE_DATA,
                articles,
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(KnowledgeSourceSideBarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    articles,
                }),
                {},
            )
        })
    })

    describe('hook calls and data flow', () => {
        it('should call useGetFeedback with correct parameters', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(useGetFeedbackMock).toHaveBeenCalledWith(
                {
                    objectId: '123',
                    objectType: 'TICKET',
                },
                {
                    enabled: true,
                },
            )
        })

        it('should call useStoreConfiguration with extracted shopName and accountDomain', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(useStoreConfigurationMock).toHaveBeenCalledWith({
                shopName: 'Test Shop',
                accountDomain: 'test.com',
                enabled: true,
            })
        })

        it('should call useFeedbackTracking with correct IDs', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(useFeedbackTrackingMock).toHaveBeenCalledWith({
                ticketId: 123,
                accountId: 1,
                userId: 789,
            })
        })

        it('should call useGetAllRelatedResourceData with correct parameters', () => {
            render(<KnowledgeSourceSidebarWrapper />)

            expect(useGetAllRelatedResourceDataMock).toHaveBeenCalledWith({
                data: MOCK_FEEDBACK_DATA,
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    helpCenterId: 456,
                    guidanceHelpCenterId: 789,
                },
                queriesEnabled: true,
            })
        })
    })

    describe('edge cases', () => {
        it('should return null when storeConfiguration is completely null', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: null,
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })

        it('should handle missing storeConfiguration shopType', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    shopName: 'Test Shop',
                    // shopType is missing
                    helpCenterId: 456,
                },
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(KnowledgeSourceSideBarMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    shopType: '',
                }),
                {},
            )
        })

        it('should handle empty helpCenter arrays', () => {
            useStoreConfigurationMock.mockReturnValue({
                storeConfiguration: {
                    shopName: 'Test Shop',
                    shopType: 'shopify',
                    // No helpCenterId or guidanceHelpCenterId
                },
            })

            useGetAllRelatedResourceDataMock.mockReturnValue({
                ...MOCK_RELATED_RESOURCE_DATA,
                helpCenters: [],
            })

            render(<KnowledgeSourceSidebarWrapper />)

            expect(
                screen.queryByTestId('knowledge-source-sidebar'),
            ).not.toBeInTheDocument()
        })
    })
})

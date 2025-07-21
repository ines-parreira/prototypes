import { act, render, screen } from '@testing-library/react'

import { NavBarDisplayMode } from 'common/navigation/hooks/useNavBar/context'
import { useNavBar } from 'common/navigation/hooks/useNavBar/useNavBar'
import { KnowledgeSourceSideBarMode } from 'pages/tickets/detail/components/AIAgentFeedbackBar/hooks/useKnowledgeSourceSideBar/context'
import { AiAgentKnowledgeResourceTypeEnum } from 'pages/tickets/detail/components/AIAgentFeedbackBar/types'
import { useSplitTicketView } from 'split-ticket-view-toggle'
import { assumeMock } from 'utils/testing'

import { useKnowledgeSourceSideBar } from '../hooks/useKnowledgeSourceSideBar/useKnowledgeSourceSideBar'
import { KnowledgeSourceSideBarProvider } from '../KnowledgeSourceSideBarProvider'

jest.mock('common/navigation/hooks/useNavBar/useNavBar')
const useNavBarMocked = assumeMock(useNavBar)

jest.mock('split-ticket-view-toggle')
const useSplitTicketViewMocked = assumeMock(useSplitTicketView)

const mockResource = {
    id: '123',
    knowledgeResourceType: AiAgentKnowledgeResourceTypeEnum.GUIDANCE,
    url: 'https://example.com',
    title: 'Test Resource',
    content: '<p>Test</p>',
}

function TestConsumer() {
    const {
        selectedResource,
        mode,
        openPreview,
        openEdit,
        openCreate,
        closeModal,
    } = useKnowledgeSourceSideBar()

    return (
        <div>
            <div data-testid="mode">{mode}</div>
            <div data-testid="title">{selectedResource?.title || ''}</div>
            <button onClick={() => openPreview(mockResource)}>
                Open Preview
            </button>
            <button onClick={() => openEdit(mockResource)}>Open Edit</button>
            <button
                onClick={() =>
                    openCreate(AiAgentKnowledgeResourceTypeEnum.ARTICLE)
                }
            >
                Open Create
            </button>
            <button onClick={closeModal}>Close</button>
        </div>
    )
}

describe('KnowledgeSourceSideBarProvider', () => {
    const setNavBarDisplay = jest.fn()
    const setIsEnabled = jest.fn()

    beforeEach(() => {
        jest.useFakeTimers()

        useNavBarMocked.mockReturnValue({
            navBarDisplay: NavBarDisplayMode.Open,
            setNavBarDisplay,
        } as any)

        useSplitTicketViewMocked.mockReturnValue({
            isEnabled: true,
            setIsEnabled,
        } as any)
    })

    afterEach(() => {
        jest.useRealTimers()
        jest.clearAllMocks()
    })
    it('sets mode and selectedResource on openPreview', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Preview').click()
        })

        expect(screen.getByTestId('mode')).toHaveTextContent(
            KnowledgeSourceSideBarMode.PREVIEW,
        )
        expect(screen.getByTestId('title')).toHaveTextContent('Test Resource')
    })

    it('sets mode and selectedResource on openEdit', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Edit').click()
        })

        expect(screen.getByTestId('mode')).toHaveTextContent(
            KnowledgeSourceSideBarMode.EDIT,
        )
        expect(screen.getByTestId('title')).toHaveTextContent('Test Resource')
    })

    it('sets mode to CREATE and initializes a blank resource on openCreate', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Create').click()
        })

        expect(screen.getByTestId('mode')).toHaveTextContent(
            KnowledgeSourceSideBarMode.CREATE,
        )
        expect(screen.getByTestId('title')).toHaveTextContent('')
    })

    it('resets mode and selectedResource on closeModal', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Preview').click()
        })

        act(() => {
            screen.getByText('Close').click()
            jest.runAllTimers()
        })

        expect(screen.getByTestId('mode')).toBeEmptyDOMElement()
        expect(screen.getByTestId('title')).toBeEmptyDOMElement()
    })

    it('calls setNavBarDisplay and setIsEnabled on openPreview (inside setTimeout)', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Preview').click()
            jest.runAllTimers()
        })

        expect(setNavBarDisplay).toHaveBeenCalledWith(
            NavBarDisplayMode.Collapsed,
        )
        expect(setIsEnabled).toHaveBeenCalledWith(false)
    })

    it('restores navBarDisplay and splitTicketView on closeModal (inside setTimeout)', () => {
        render(
            <KnowledgeSourceSideBarProvider>
                <TestConsumer />
            </KnowledgeSourceSideBarProvider>,
        )

        act(() => {
            screen.getByText('Open Preview').click()
            jest.runAllTimers()
        })

        expect(setNavBarDisplay).toHaveBeenLastCalledWith(
            NavBarDisplayMode.Collapsed,
        )

        act(() => {
            screen.getByText('Close').click()
            jest.runAllTimers()
        })

        expect(setNavBarDisplay).toHaveBeenLastCalledWith(
            NavBarDisplayMode.Open,
        )
        expect(setIsEnabled).toHaveBeenLastCalledWith(true)
    })
})

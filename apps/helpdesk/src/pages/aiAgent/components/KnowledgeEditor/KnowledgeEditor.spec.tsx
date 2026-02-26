import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SnippetType } from 'pages/aiAgent/KnowledgeHub/types'

import { KnowledgeEditor } from './KnowledgeEditor'

const sharedPanelWidth = '72vw'
const sharedPanelOnRequestClose = jest.fn()
const defaultPanelBaseWidth =
    'calc(calc(max(920px, 66vw)) + calc(var(--spacing-xs) * 2))'

jest.mock('@gorgias/axiom', () => ({
    SidePanel: ({
        isOpen,
        onOpenChange,
        width,
        children,
    }: {
        isOpen: boolean
        onOpenChange: (open: boolean) => void
        width: string
        children: React.ReactNode
    }) =>
        isOpen ? (
            <div data-testid="side-panel" data-width={width}>
                <button
                    data-testid="close-panel-button"
                    onClick={() => onOpenChange(false)}
                >
                    Close
                </button>
                {children}
            </div>
        ) : null,
}))

jest.mock('./KnowledgeEditorGuidance/KnowledgeEditorGuidance', () => ({
    KnowledgeEditorGuidance: jest.fn(() => <div>KnowledgeEditorGuidance</div>),
}))

jest.mock('./KnowledgeEditorSnippet/KnowledgeEditorSnippet', () => ({
    KnowledgeEditorSnippet: jest.fn(() => <div>KnowledgeEditorSnippet</div>),
}))

jest.mock(
    './KnowledgeEditorHelpCenterArticle/KnowledgeEditorHelpCenterArticle',
    () => ({
        KnowledgeEditorHelpCenterArticle: jest.fn(() => (
            <div>KnowledgeEditorHelpCenterArticle</div>
        )),
    }),
)

describe('KnowledgeEditor', () => {
    beforeEach(() => {
        sharedPanelOnRequestClose.mockReset()
    })

    it('renders guidance editor when variant is guidance', () => {
        render(
            <KnowledgeEditor
                variant="guidance"
                shopName="Test Shop"
                shopType="Test Shop Type"
                guidanceArticleId={1}
                onClose={jest.fn()}
                onClickPrevious={jest.fn()}
                onClickNext={jest.fn()}
                guidanceMode="read"
                isOpen
            />,
        )

        expect(screen.getByText('KnowledgeEditorGuidance')).toBeInTheDocument()
    })

    it('renders snippet editor when variant is snippet', () => {
        render(
            <KnowledgeEditor
                variant="snippet"
                shopName="Test Shop"
                snippetId={1}
                snippetType={SnippetType.URL}
                onClose={jest.fn()}
                isOpen
            />,
        )

        expect(screen.getByText('KnowledgeEditorSnippet')).toBeInTheDocument()
    })

    it('renders article editor when variant is article', () => {
        render(
            <KnowledgeEditor
                variant="article"
                helpCenterId={1}
                onClose={jest.fn()}
                article={
                    {
                        type: 'new',
                        onCreated: jest.fn(),
                    } as any
                }
            />,
        )

        expect(
            screen.getByText('KnowledgeEditorHelpCenterArticle'),
        ).toBeInTheDocument()
    })

    it('does not render when the active variant is closed', () => {
        render(
            <KnowledgeEditor
                variant="snippet"
                shopName="Test Shop"
                snippetId={1}
                snippetType={SnippetType.URL}
                onClose={jest.fn()}
                isOpen={false}
            />,
        )

        expect(screen.queryByTestId('side-panel')).not.toBeInTheDocument()
    })

    it('passes shared panel state callback to snippet editor', () => {
        const mockSnippetComponent = jest.requireMock(
            './KnowledgeEditorSnippet/KnowledgeEditorSnippet',
        ).KnowledgeEditorSnippet as jest.Mock

        render(
            <KnowledgeEditor
                variant="snippet"
                shopName="Test Shop"
                snippetId={1}
                snippetType={SnippetType.URL}
                onClose={jest.fn()}
                isOpen
            />,
        )

        expect(mockSnippetComponent).toHaveBeenCalled()

        const snippetProps = mockSnippetComponent.mock.calls.at(-1)?.[0]
        expect(snippetProps).toEqual(
            expect.objectContaining({
                onSharedPanelStateChange: expect.any(Function),
            }),
        )
        expect(snippetProps.sharedPanel).toBeUndefined()
    })

    it('uses shared child close handler when side panel is dismissed', async () => {
        const user = userEvent.setup()
        const onClose = jest.fn()
        const mockSnippetComponent = jest.requireMock(
            './KnowledgeEditorSnippet/KnowledgeEditorSnippet',
        ).KnowledgeEditorSnippet as jest.Mock

        render(
            <KnowledgeEditor
                variant="snippet"
                shopName="Test Shop"
                snippetId={1}
                snippetType={SnippetType.URL}
                onClose={onClose}
                isOpen
            />,
        )

        const snippetProps = mockSnippetComponent.mock.calls.at(-1)?.[0]

        act(() => {
            snippetProps.onSharedPanelStateChange({
                width: sharedPanelWidth,
                onRequestClose: sharedPanelOnRequestClose,
            })
        })

        await waitFor(() => {
            expect(screen.getByTestId('side-panel')).toHaveAttribute(
                'data-width',
                sharedPanelWidth,
            )
        })

        await user.click(screen.getByTestId('close-panel-button'))

        expect(sharedPanelOnRequestClose).toHaveBeenCalledTimes(1)
        expect(onClose).not.toHaveBeenCalled()
    })

    it('resets shared panel state when variant changes', async () => {
        const mockSnippetComponent = jest.requireMock(
            './KnowledgeEditorSnippet/KnowledgeEditorSnippet',
        ).KnowledgeEditorSnippet as jest.Mock

        const { rerender } = render(
            <KnowledgeEditor
                variant="snippet"
                shopName="Test Shop"
                snippetId={1}
                snippetType={SnippetType.URL}
                onClose={jest.fn()}
                isOpen
            />,
        )

        const snippetProps = mockSnippetComponent.mock.calls.at(-1)?.[0]

        act(() => {
            snippetProps.onSharedPanelStateChange({
                width: sharedPanelWidth,
                onRequestClose: sharedPanelOnRequestClose,
            })
        })

        await waitFor(() => {
            expect(screen.getByTestId('side-panel')).toHaveAttribute(
                'data-width',
                sharedPanelWidth,
            )
        })

        rerender(
            <KnowledgeEditor
                variant="guidance"
                shopName="Test Shop"
                shopType="Test Shop Type"
                guidanceArticleId={1}
                onClose={jest.fn()}
                onClickPrevious={jest.fn()}
                onClickNext={jest.fn()}
                guidanceMode="read"
                isOpen
            />,
        )

        await waitFor(() => {
            expect(screen.getByTestId('side-panel')).toHaveAttribute(
                'data-width',
                defaultPanelBaseWidth,
            )
        })
    })
})

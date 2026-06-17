import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'

describe('KnowledgeEditorTopBar', () => {
    it('renders', () => {
        const onClose = jest.fn()
        const onToggleDetailsView = jest.fn()
        const onClickPrevious = jest.fn()
        const onClickNext = jest.fn()
        const onChangeTitle = jest.fn()
        const onToggleFullscreen = jest.fn()

        const { rerender } = render(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={false}
                onToggleDetailsView={onToggleDetailsView}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                onChangeTitle={onChangeTitle}
            >
                <div>Test Content</div>
            </KnowledgeEditorTopBar>,
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'previous' }))
        expect(onClickPrevious).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'next' }))
        expect(onClickNext).toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'close' }))
        expect(onClose).toHaveBeenCalled()

        fireEvent.click(
            screen.getByRole('button', { name: 'expand side panel' }),
        )
        expect(onToggleDetailsView).toHaveBeenCalled()

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'New Title' },
        })
        expect(onChangeTitle).toHaveBeenCalledWith('New Title')

        fireEvent.click(screen.getByRole('button', { name: 'fullscreen' }))
        expect(onToggleFullscreen).toHaveBeenCalled()

        rerender(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={true}
                onToggleFullscreen={onToggleFullscreen}
                onClose={onClose}
                isDetailsView={false}
                onToggleDetailsView={onToggleDetailsView}
                onClickPrevious={onClickPrevious}
                onClickNext={onClickNext}
                onChangeTitle={onChangeTitle}
            >
                <div>Test Content</div>
            </KnowledgeEditorTopBar>,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        )
        expect(onToggleFullscreen).toHaveBeenCalledTimes(2)
    })

    it('spreads the status copilot anchor onto the controls container', () => {
        const { container } = render(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={jest.fn()}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
                statusAnchorProps={{
                    'data-copilot-anchor': 'guidance:1:status',
                }}
            >
                <button>Publish</button>
            </KnowledgeEditorTopBar>,
        )

        const statusAnchor = container.querySelector(
            '[data-copilot-anchor="guidance:1:status"]',
        )
        expect(statusAnchor).toBeInTheDocument()
        expect(statusAnchor?.querySelector('button')).toHaveTextContent(
            'Publish',
        )
    })

    it('renders disabled when updating', () => {
        render(
            <KnowledgeEditorTopBar
                disabled={true}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={jest.fn()}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
            >
                <div>Test Content</div>
            </KnowledgeEditorTopBar>,
        )

        expect(screen.getByRole('button', { name: 'close' })).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'expand side panel' }),
        ).toBeDisabled()
    })

    it('disables navigation buttons when not provided', () => {
        render(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={jest.fn()}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
            />,
        )

        expect(
            screen.queryByRole('button', { name: 'previous' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'next' }),
        ).not.toBeInTheDocument()
    })

    it('shows last saved indicator when editorMode is edit', () => {
        render(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={jest.fn()}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
                editorMode="edit"
                lastUpdatedDatetime={new Date('2024-01-15T10:30:00Z')}
            />,
        )

        expect(
            screen.getByRole('img', { name: 'cloud-check' }),
        ).toBeInTheDocument()
    })

    it('does not show last saved indicator when editorMode is not edit and onChangeTitle is not provided', () => {
        render(
            <KnowledgeEditorTopBar
                disabled={false}
                title="Guidance"
                isFullscreen={false}
                onToggleFullscreen={jest.fn()}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
                editorMode="read"
                lastUpdatedDatetime={new Date('2024-01-15T10:30:00Z')}
            />,
        )

        expect(
            screen.queryByRole('img', { name: 'cloud-check' }),
        ).not.toBeInTheDocument()
    })

    describe('shouldHideFullscreenButton prop', () => {
        it('should render fullscreen button by default when shouldHideFullscreenButton is not provided', () => {
            render(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                />,
            )

            expect(
                screen.getByRole('button', { name: 'fullscreen' }),
            ).toBeInTheDocument()
        })

        it('should render fullscreen button when shouldHideFullscreenButton is false', () => {
            render(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    shouldHideFullscreenButton={false}
                />,
            )

            expect(
                screen.getByRole('button', { name: 'fullscreen' }),
            ).toBeInTheDocument()
        })

        it('should hide fullscreen button when shouldHideFullscreenButton is true', () => {
            render(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    shouldHideFullscreenButton={true}
                />,
            )

            expect(
                screen.queryByRole('button', { name: 'fullscreen' }),
            ).not.toBeInTheDocument()
        })

        it('should hide fullscreen button when shouldHideFullscreenButton is true regardless of isFullscreen state', () => {
            render(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={true}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    shouldHideFullscreenButton={true}
                />,
            )

            // Should not find button with either label
            expect(
                screen.queryByRole('button', { name: 'fullscreen' }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('button', { name: 'leave fullscreen' }),
            ).not.toBeInTheDocument()
        })

        it('should still respond to isFullscreen prop when button is visible', () => {
            const { rerender } = render(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    shouldHideFullscreenButton={false}
                />,
            )

            // Initially not fullscreen
            expect(
                screen.getByRole('button', { name: 'fullscreen' }),
            ).toBeInTheDocument()

            // Rerender with fullscreen
            rerender(
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={true}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    shouldHideFullscreenButton={false}
                />,
            )

            // Now fullscreen
            expect(
                screen.getByRole('button', { name: 'leave fullscreen' }),
            ).toBeInTheDocument()
        })
    })
})

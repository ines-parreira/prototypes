import { fireEvent, render, screen } from '@testing-library/react'

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
            />,
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
})

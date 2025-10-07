import { fireEvent, render, screen } from '@testing-library/react'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'

describe('KnowledgeEditorTopBar', () => {
    it('renders', () => {
        const onToggleFullscreen = jest.fn()
        const onClose = jest.fn()
        const onToggleDetailsView = jest.fn()
        const onClickPrevious = jest.fn()
        const onClickNext = jest.fn()
        const onChangeTitle = jest.fn()

        render(
            <KnowledgeEditorTopBar
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

        fireEvent.click(screen.getByRole('button', { name: 'fullscreen' }))

        expect(onToggleFullscreen).toHaveBeenCalled()

        fireEvent.click(
            screen.getByRole('button', { name: 'expand side panel' }),
        )

        expect(onToggleDetailsView).toHaveBeenCalled()

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: 'New Title' },
        })

        expect(onChangeTitle).toHaveBeenCalledWith('New Title')
    })

    it('renders fullscreen', () => {
        const onToggleFullscreen = jest.fn()

        render(
            <KnowledgeEditorTopBar
                title="Guidance"
                isFullscreen={true}
                onToggleFullscreen={onToggleFullscreen}
                onClose={jest.fn()}
                isDetailsView={false}
                onToggleDetailsView={jest.fn()}
            />,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        )

        expect(onToggleFullscreen).toHaveBeenCalled()
    })
})

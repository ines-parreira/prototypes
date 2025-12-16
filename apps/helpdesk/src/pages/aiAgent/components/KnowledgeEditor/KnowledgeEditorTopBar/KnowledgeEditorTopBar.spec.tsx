import { fireEvent, render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'

import { mockStore } from 'utils/testing'

import { KnowledgeEditorTopBar } from './KnowledgeEditorTopBar'

const store = mockStore({})

describe('KnowledgeEditorTopBar', () => {
    it('renders', () => {
        const onClose = jest.fn()
        const onToggleDetailsView = jest.fn()
        const onClickPrevious = jest.fn()
        const onClickNext = jest.fn()
        const onChangeTitle = jest.fn()
        const onToggleFullscreen = jest.fn()

        const { rerender } = render(
            <Provider store={store}>
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
                </KnowledgeEditorTopBar>
            </Provider>,
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
            <Provider store={store}>
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
                </KnowledgeEditorTopBar>
            </Provider>,
        )

        fireEvent.click(
            screen.getByRole('button', { name: 'leave fullscreen' }),
        )
        expect(onToggleFullscreen).toHaveBeenCalledTimes(2)
    })

    it('renders disabled when updating', () => {
        render(
            <Provider store={store}>
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
                </KnowledgeEditorTopBar>
            </Provider>,
        )

        expect(screen.getByRole('button', { name: 'close' })).toBeDisabled()
        expect(
            screen.getByRole('button', { name: 'expand side panel' }),
        ).toBeDisabled()
    })

    it('disables navigation buttons when not provided', () => {
        render(
            <Provider store={store}>
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                />
            </Provider>,
        )

        expect(
            screen.queryByRole('button', { name: 'previous' }),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: 'next' }),
        ).not.toBeInTheDocument()
    })

    it('shows last saved indicator when guidanceMode is edit', () => {
        render(
            <Provider store={store}>
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    guidanceMode="edit"
                    lastUpdatedDatetime={new Date('2024-01-15T10:30:00Z')}
                />
            </Provider>,
        )

        expect(
            screen.getByRole('img', { name: 'cloud-check' }),
        ).toBeInTheDocument()
    })

    it('does not show last saved indicator when guidanceMode is not edit and onChangeTitle is not provided', () => {
        render(
            <Provider store={store}>
                <KnowledgeEditorTopBar
                    disabled={false}
                    title="Guidance"
                    isFullscreen={false}
                    onToggleFullscreen={jest.fn()}
                    onClose={jest.fn()}
                    isDetailsView={false}
                    onToggleDetailsView={jest.fn()}
                    guidanceMode="read"
                    lastUpdatedDatetime={new Date('2024-01-15T10:30:00Z')}
                />
            </Provider>,
        )

        expect(
            screen.queryByRole('img', { name: 'cloud-check' }),
        ).not.toBeInTheDocument()
    })
})

import { act, render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { DisplayedContent, FetchingState } from '../constants'
import {
    useTicketMessageDisplayState,
    useTicketMessageTranslationDisplay,
} from '../useTicketMessageTranslationDisplay'

// Test component to access store values
function TestConsumer() {
    const context = useTicketMessageTranslationDisplay()

    return (
        <div>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 1,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set message 1 to original"
            >
                Set Original
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 2,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set message 2 to translated"
            >
                Set Translated
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 3,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set message 3 to original"
            >
                Set Original 3
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 1,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                            hasRegeneratedOnce: false,
                        },
                        {
                            messageId: 2,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set multiple messages"
            >
                Set Multiple
            </button>
            <button
                onClick={() =>
                    context.setTicketMessageTranslationDisplay([
                        {
                            messageId: 4,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                            hasRegeneratedOnce: true,
                        },
                    ])
                }
                aria-label="Set message 4 with regenerated"
            >
                Set Regenerated
            </button>
            <div data-testid="message-1-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(1))}
            </div>
            <div data-testid="message-2-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(2))}
            </div>
            <div data-testid="message-3-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(3))}
            </div>
            <div data-testid="message-4-display">
                {JSON.stringify(context.getTicketMessageTranslationDisplay(4))}
            </div>
            <div data-testid="message-999-display">
                {JSON.stringify(
                    context.getTicketMessageTranslationDisplay(999),
                )}
            </div>
        </div>
    )
}

describe('useTicketMessageTranslationDisplay', () => {
    beforeEach(() => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Translated,
        })
    })

    it('should render children without crashing', () => {
        render(<div>Test Content</div>)

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should provide default values', () => {
        render(<TestConsumer />)

        const defaultDisplay = JSON.parse(
            screen.getByTestId('message-999-display').textContent || '{}',
        )
        expect(defaultDisplay.display).toBe(DisplayedContent.Original)
        expect(defaultDisplay.fetchingState).toBe(FetchingState.Idle)
        expect(defaultDisplay.hasRegeneratedOnce).toBe(false)
    })

    it('should allow setting and getting translation display for specific message IDs', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })

        display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
        expect(display2.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 3 to original'))
        })

        const display3 = JSON.parse(
            screen.getByTestId('message-3-display').textContent || '{}',
        )
        expect(display3.display).toBe(DisplayedContent.Original)
        expect(display3.fetchingState).toBe(FetchingState.Idle)
        expect(display3.hasRegeneratedOnce).toBe(false)
    })

    it('should maintain separate state for different message IDs', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        await act(async () => {
            await user.click(screen.getByLabelText('Set message 3 to original'))
        })

        const display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
        expect(display2.hasRegeneratedOnce).toBe(false)

        const display3 = JSON.parse(
            screen.getByTestId('message-3-display').textContent || '{}',
        )
        expect(display3.display).toBe(DisplayedContent.Original)
        expect(display3.fetchingState).toBe(FetchingState.Idle)
        expect(display3.hasRegeneratedOnce).toBe(false)
    })

    it('should update state when setTicketMessageTranslationDisplay is called multiple times', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })

        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
        expect(display2.hasRegeneratedOnce).toBe(false)
    })

    it('should provide stable callback references', () => {
        const { rerender } = render(<TestConsumer />)

        const firstRender = screen.getByTestId('message-1-display')
        const initialValue = firstRender.textContent || ''

        rerender(<TestConsumer />)

        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            initialValue,
        )
    })

    it('should handle multiple children correctly', () => {
        render(
            <div>
                <div>Child 1</div>
                <div>Child 2</div>
                <TestConsumer />
            </div>,
        )

        expect(screen.getByText('Child 1')).toBeInTheDocument()
        expect(screen.getByText('Child 2')).toBeInTheDocument()
        expect(screen.getByTestId('message-1-display')).toBeInTheDocument()
    })

    it('should override existing message display when setTicketMessageTranslationDisplay is called again', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })

        let display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
        expect(display2.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(screen.getByLabelText('Set message 1 to original'))
        })

        display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)
    })

    it('should handle batch updates for multiple messages', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        await act(async () => {
            await user.click(screen.getByLabelText('Set multiple messages'))
        })

        const display1 = JSON.parse(
            screen.getByTestId('message-1-display').textContent || '{}',
        )
        expect(display1.display).toBe(DisplayedContent.Original)
        expect(display1.fetchingState).toBe(FetchingState.Idle)
        expect(display1.hasRegeneratedOnce).toBe(false)

        const display2 = JSON.parse(
            screen.getByTestId('message-2-display').textContent || '{}',
        )
        expect(display2.display).toBe(DisplayedContent.Translated)
        expect(display2.fetchingState).toBe(FetchingState.Completed)
        expect(display2.hasRegeneratedOnce).toBe(false)
    })

    it('should correctly handle hasRegeneratedOnce flag', async () => {
        const user = userEvent.setup()

        render(<TestConsumer />)

        let display4 = JSON.parse(
            screen.getByTestId('message-4-display').textContent || '{}',
        )
        expect(display4.display).toBe(DisplayedContent.Original)
        expect(display4.fetchingState).toBe(FetchingState.Idle)
        expect(display4.hasRegeneratedOnce).toBe(false)

        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 4 with regenerated'),
            )
        })

        display4 = JSON.parse(
            screen.getByTestId('message-4-display').textContent || '{}',
        )
        expect(display4.display).toBe(DisplayedContent.Translated)
        expect(display4.fetchingState).toBe(FetchingState.Completed)
        expect(display4.hasRegeneratedOnce).toBe(true)

        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 2 to translated'),
            )
        })
        await act(async () => {
            await user.click(
                screen.getByLabelText('Set message 4 with regenerated'),
            )
        })

        display4 = JSON.parse(
            screen.getByTestId('message-4-display').textContent || '{}',
        )
        expect(display4.hasRegeneratedOnce).toBe(true)
    })
})

// Test component for useTicketMessageDisplayState hook
function TestMessageDisplayState({ messageId }: { messageId: number }) {
    const {
        display,
        fetchingState,
        hasRegeneratedOnce,
        setTicketMessageTranslationDisplay,
    } = useTicketMessageDisplayState(messageId)

    return (
        <div>
            <div data-testid={`message-${messageId}-display`}>{display}</div>
            <div data-testid={`message-${messageId}-fetchingState`}>
                {fetchingState}
            </div>
            <div data-testid={`message-${messageId}-hasRegeneratedOnce`}>
                {String(hasRegeneratedOnce)}
            </div>
            <button
                onClick={() =>
                    setTicketMessageTranslationDisplay([
                        {
                            messageId,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set to translated"
            >
                Set Translated
            </button>
            <button
                onClick={() =>
                    setTicketMessageTranslationDisplay([
                        {
                            messageId,
                            display: DisplayedContent.Original,
                            fetchingState: FetchingState.Idle,
                            hasRegeneratedOnce: false,
                        },
                    ])
                }
                aria-label="Set to original"
            >
                Set Original
            </button>
            <button
                onClick={() =>
                    setTicketMessageTranslationDisplay([
                        {
                            messageId,
                            display: DisplayedContent.Translated,
                            fetchingState: FetchingState.Completed,
                            hasRegeneratedOnce: true,
                        },
                    ])
                }
                aria-label="Set with regenerated flag"
            >
                Set Regenerated
            </button>
        </div>
    )
}

describe('useTicketMessageDisplayState', () => {
    beforeEach(() => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Translated,
        })
    })

    it('should return default values for non-existent message', () => {
        render(<TestMessageDisplayState messageId={999} />)

        expect(screen.getByTestId('message-999-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
        expect(
            screen.getByTestId('message-999-fetchingState'),
        ).toHaveTextContent(FetchingState.Idle)
        expect(
            screen.getByTestId('message-999-hasRegeneratedOnce'),
        ).toHaveTextContent('false')
    })

    it('should return message-specific state', async () => {
        const user = userEvent.setup()

        render(<TestMessageDisplayState messageId={1} />)

        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
        expect(screen.getByTestId('message-1-fetchingState')).toHaveTextContent(
            FetchingState.Idle,
        )

        await act(async () => {
            await user.click(screen.getByLabelText('Set to translated'))
        })

        expect(screen.getByTestId('message-1-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
        expect(screen.getByTestId('message-1-fetchingState')).toHaveTextContent(
            FetchingState.Completed,
        )
    })

    it('should update state when setTicketMessageTranslationDisplay is called', async () => {
        const user = userEvent.setup()

        render(<TestMessageDisplayState messageId={2} />)

        await act(async () => {
            await user.click(screen.getByLabelText('Set to original'))
        })

        expect(screen.getByTestId('message-2-display')).toHaveTextContent(
            DisplayedContent.Original,
        )
        expect(screen.getByTestId('message-2-fetchingState')).toHaveTextContent(
            FetchingState.Idle,
        )

        await act(async () => {
            await user.click(screen.getByLabelText('Set to translated'))
        })

        expect(screen.getByTestId('message-2-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
        expect(screen.getByTestId('message-2-fetchingState')).toHaveTextContent(
            FetchingState.Completed,
        )
    })

    it('should handle hasRegeneratedOnce flag correctly', async () => {
        const user = userEvent.setup()

        render(<TestMessageDisplayState messageId={3} />)

        expect(
            screen.getByTestId('message-3-hasRegeneratedOnce'),
        ).toHaveTextContent('false')

        await act(async () => {
            await user.click(screen.getByLabelText('Set with regenerated flag'))
        })

        expect(
            screen.getByTestId('message-3-hasRegeneratedOnce'),
        ).toHaveTextContent('true')
        expect(screen.getByTestId('message-3-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )
    })

    it('should only re-render when specific message state changes', async () => {
        const user = userEvent.setup()
        let renderCount1 = 0
        let renderCount2 = 0

        function TestComponentWithRenderCount1() {
            const state = useTicketMessageDisplayState(1)
            renderCount1++
            return (
                <div>
                    <div data-testid="render-count-1">{renderCount1}</div>
                    <div data-testid="message-1-state">
                        {JSON.stringify(state)}
                    </div>
                </div>
            )
        }

        function TestComponentWithRenderCount2() {
            const state = useTicketMessageDisplayState(2)
            renderCount2++
            return (
                <div>
                    <div data-testid="render-count-2">{renderCount2}</div>
                    <div data-testid="message-2-state">
                        {JSON.stringify(state)}
                    </div>
                </div>
            )
        }

        render(
            <div>
                <TestComponentWithRenderCount1 />
                <TestComponentWithRenderCount2 />
                <TestMessageDisplayState messageId={1} />
            </div>,
        )

        const initialRenderCount1 = Number(
            screen.getByTestId('render-count-1').textContent,
        )
        const initialRenderCount2 = Number(
            screen.getByTestId('render-count-2').textContent,
        )

        await act(async () => {
            await user.click(screen.getByLabelText('Set to translated'))
        })

        const updatedRenderCount1 = Number(
            screen.getByTestId('render-count-1').textContent,
        )
        const updatedRenderCount2 = Number(
            screen.getByTestId('render-count-2').textContent,
        )

        expect(updatedRenderCount1).toBeGreaterThan(initialRenderCount1)
        expect(updatedRenderCount2).toBe(initialRenderCount2)
    })

    it('should provide access to setTicketMessageTranslationDisplay', async () => {
        const user = userEvent.setup()

        render(<TestMessageDisplayState messageId={4} />)

        expect(screen.getByTestId('message-4-display')).toHaveTextContent(
            DisplayedContent.Original,
        )

        await act(async () => {
            await user.click(screen.getByLabelText('Set to translated'))
        })

        expect(screen.getByTestId('message-4-display')).toHaveTextContent(
            DisplayedContent.Translated,
        )

        const globalState = useTicketMessageTranslationDisplay.getState()
        const messageState = globalState.ticketMessagesTranslationDisplayMap[4]
        expect(messageState).toBeDefined()
        expect(messageState?.display).toBe(DisplayedContent.Translated)
    })
})

describe('setAllTicketMessagesToOriginal', () => {
    beforeEach(() => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {
                1: {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
                2: {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: true,
                },
                3: {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                },
            },
            allMessageDisplayState: DisplayedContent.Translated,
        })
    })

    it('should set all messages to original display', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToOriginal()

        const state = useTicketMessageTranslationDisplay.getState()
        const map = state.ticketMessagesTranslationDisplayMap

        expect(map[1].display).toBe(DisplayedContent.Original)
        expect(map[2].display).toBe(DisplayedContent.Original)
        expect(map[3].display).toBe(DisplayedContent.Original)
    })

    it('should preserve other properties when setting to original', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToOriginal()

        const state = useTicketMessageTranslationDisplay.getState()
        const map = state.ticketMessagesTranslationDisplayMap

        expect(map[1].fetchingState).toBe(FetchingState.Completed)
        expect(map[1].hasRegeneratedOnce).toBe(false)

        expect(map[2].fetchingState).toBe(FetchingState.Completed)
        expect(map[2].hasRegeneratedOnce).toBe(true)

        expect(map[3].fetchingState).toBe(FetchingState.Idle)
        expect(map[3].hasRegeneratedOnce).toBe(false)
    })

    it('should update allMessageDisplayState to original', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        expect(store.allMessageDisplayState).toBe(DisplayedContent.Translated)

        store.setAllTicketMessagesToOriginal()

        const state = useTicketMessageTranslationDisplay.getState()
        expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)
    })

    it('should handle empty message map', () => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Translated,
        })

        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToOriginal()

        const state = useTicketMessageTranslationDisplay.getState()
        expect(state.ticketMessagesTranslationDisplayMap).toEqual({})
        expect(state.allMessageDisplayState).toBe(DisplayedContent.Original)
    })
})

describe('setAllTicketMessagesToTranslated', () => {
    beforeEach(() => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {
                1: {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Idle,
                    hasRegeneratedOnce: false,
                },
                2: {
                    display: DisplayedContent.Original,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: true,
                },
                3: {
                    display: DisplayedContent.Translated,
                    fetchingState: FetchingState.Completed,
                    hasRegeneratedOnce: false,
                },
            },
            allMessageDisplayState: DisplayedContent.Original,
        })
    })

    it('should set all messages to translated display', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToTranslated()

        const state = useTicketMessageTranslationDisplay.getState()
        const map = state.ticketMessagesTranslationDisplayMap

        expect(map[1].display).toBe(DisplayedContent.Translated)
        expect(map[2].display).toBe(DisplayedContent.Translated)
        expect(map[3].display).toBe(DisplayedContent.Translated)
    })

    it('should preserve other properties when setting to translated', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToTranslated()

        const state = useTicketMessageTranslationDisplay.getState()
        const map = state.ticketMessagesTranslationDisplayMap

        expect(map[1].fetchingState).toBe(FetchingState.Idle)
        expect(map[1].hasRegeneratedOnce).toBe(false)

        expect(map[2].fetchingState).toBe(FetchingState.Completed)
        expect(map[2].hasRegeneratedOnce).toBe(true)

        expect(map[3].fetchingState).toBe(FetchingState.Completed)
        expect(map[3].hasRegeneratedOnce).toBe(false)
    })

    it('should update allMessageDisplayState to translated', () => {
        const store = useTicketMessageTranslationDisplay.getState()
        expect(store.allMessageDisplayState).toBe(DisplayedContent.Original)

        store.setAllTicketMessagesToTranslated()

        const state = useTicketMessageTranslationDisplay.getState()
        expect(state.allMessageDisplayState).toBe(DisplayedContent.Translated)
    })

    it('should handle empty message map', () => {
        useTicketMessageTranslationDisplay.setState({
            ticketMessagesTranslationDisplayMap: {},
            allMessageDisplayState: DisplayedContent.Original,
        })

        const store = useTicketMessageTranslationDisplay.getState()
        store.setAllTicketMessagesToTranslated()

        const state = useTicketMessageTranslationDisplay.getState()
        expect(state.ticketMessagesTranslationDisplayMap).toEqual({})
        expect(state.allMessageDisplayState).toBe(DisplayedContent.Translated)
    })
})

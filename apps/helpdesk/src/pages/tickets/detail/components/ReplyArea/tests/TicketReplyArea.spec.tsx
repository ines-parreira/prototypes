import type { ComponentProps } from 'react'
import React from 'react'

import { fireEvent, getByTestId, render, waitFor } from '@testing-library/react'
import { ContentState } from 'draft-js'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { Language } from '@gorgias/helpdesk-queries'

import { TicketMessageSourceType } from 'business/types/ticket'
import { macros } from 'fixtures/macro'
import type { InTicketSuggestionState } from 'state/entities/rules/types'
import { makeExecuteKeyboardAction } from 'utils/testing'

import type TicketMacrosSearch from '../TicketMacrosSearch'
import TicketReply from '../TicketReply'
import { TicketReplyArea } from '../TicketReplyArea'

const mockedStore = configureMockStore([thunk])

type Props = {
    richAreaRef: (value: any) => void
}

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFilters</div>
))

jest.mock('../TicketReply', () => {
    const { Component } = jest.requireActual('react')
    const focusEditor = jest.fn()
    let capturedOnKeyDown: ((e: any) => void) | undefined

    class TicketReplyMock extends Component<Props> {
        focusEditor = focusEditor
        isFocused = jest.fn().mockReturnValue(false)

        render() {
            const { richAreaRef, onKeyDown }: any = this.props
            capturedOnKeyDown = onKeyDown
            richAreaRef(this)

            return <div>hello</div>
        }
    }
    TicketReplyMock.mocks = {
        focusEditor,
        getCapturedOnKeyDown: () => capturedOnKeyDown,
    }

    return TicketReplyMock
})

type TicketMacrosMockProps = {
    onClearMacro: () => void
}

jest.mock(
    '../TicketMacros',
    () =>
        ({ onClearMacro }: TicketMacrosMockProps) => (
            <div>
                TicketMacros mock
                <button className="clear-macro" onClick={onClearMacro}>
                    clear mocks
                </button>
            </div>
        ),
)

jest.mock(
    '../TicketMacrosSearch',
    () =>
        ({
            showMacros,
            handleSearchKeyDown,
            setFocus,
        }: ComponentProps<typeof TicketMacrosSearch>) => (
            <input
                data-testid="ticket-macro-search"
                onKeyDown={handleSearchKeyDown}
                onFocus={() => showMacros()}
                ref={(el: HTMLInputElement | null) => el && setFocus?.(el)}
            />
        ),
)

jest.mock('@repo/utils', () => {
    const actual = jest.requireActual('@repo/utils')
    return {
        ...actual,
        shortcutManager: {
            bind: jest.fn(),
            unbind: jest.fn(),
        },
    }
})

const { shortcutManager: shortcutManagerMock } = jest.requireMock('@repo/utils')

const minProps = {
    ticket: fromJS({}),
    currentUser: fromJS({}),
    lastMessage: fromJS({ id: 10 }),
    customers: {},
    preferences: fromJS({}),
    newMessage: fromJS({
        contentState: null,
        newMessage: { body_text: 'Hello world' },
    }),
    newMessageType: TicketMessageSourceType.Email,
    notify: jest.fn(),
    currentMacro: {},
    page: 1,
    totalPages: 1,
    selectMacro: jest.fn(),
    fetchMacrosCancellable: () => Promise.resolve(),
    applyMacro: jest.fn(),
    currentTicket: fromJS({
        id: 1,
        messages: [{ id: 1 }],
    }),
    cacheAdded: false,
    filters: {},
    hasShownMacros: false,
    initialMacrosLoaded: false,
    isMacrosActive: false,
    loadMacros: jest.fn(),
    macros: [],
    query: '',
    onChangeFilters: jest.fn(),
    onChangeMacrosActive: jest.fn(),
    onChangeQuery: jest.fn(),
    hasAutomate: false,
    isMacrosLoading: false,
    appliedMacro: fromJS({}),
    topRankMacroState: null,
    inTicketSuggestionState: 'ignored' as InTicketSuggestionState,
    clearAppliedMacro: jest.fn(),
}

describe('<TicketReplyArea/>', () => {
    it('should render', () => {
        const { container } = render(<TicketReplyArea {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it("should hide macros when newMessageType becomes 'internal-note'", () => {
        const props = {
            ...minProps,
            hasShownMacros: true,
            isMacrosActive: true,
        }
        const { queryByText, rerender } = render(<TicketReplyArea {...props} />)

        expect(queryByText(/TicketMacros mock/i)).toBeInTheDocument()

        rerender(
            <TicketReplyArea
                {...props}
                newMessageType={TicketMessageSourceType.InternalNote}
            />,
        )

        expect(minProps.onChangeMacrosActive).toHaveBeenCalledWith(false)

        rerender(
            <TicketReplyArea
                {...props}
                newMessageType={TicketMessageSourceType.InternalNote}
                isMacrosActive={false}
            />,
        )
        expect(queryByText(/TicketMacros mock/i)).not.toBeInTheDocument()
    })

    it('should hide macros when editor has text', () => {
        const props = {
            ...minProps,
            hasShownMacros: true,
            isMacrosActive: true,
        }
        const { queryByText, rerender } = render(<TicketReplyArea {...props} />)

        expect(queryByText(/TicketMacros mock/i)).toBeInTheDocument()

        rerender(
            <TicketReplyArea
                {...props}
                newMessage={fromJS({
                    state: {
                        contentState: ContentState.createFromText('test'),
                    },
                    newMessage: { body_text: 'test' },
                })}
            />,
        )
        expect(minProps.onChangeMacrosActive).toHaveBeenCalledWith(false)

        rerender(
            <TicketReplyArea
                {...props}
                newMessage={fromJS({
                    state: {
                        contentState: ContentState.createFromText('test'),
                    },
                    newMessage: { body_text: 'test' },
                })}
                isMacrosActive={false}
            />,
        )
        expect(queryByText(/'TicketMacros mock'/i)).not.toBeInTheDocument()
    })

    it("should not focus editor when newMessageType becomes 'internal-note'", () => {
        const { rerender } = render(<TicketReplyArea {...minProps} />)
        rerender(
            <TicketReplyArea
                {...minProps}
                newMessageType={TicketMessageSourceType.InternalNote}
            />,
        )

        expect(
            (
                TicketReply as unknown as {
                    mocks: { focusEditor: jest.MockedFunction<any> }
                }
            ).mocks.focusEditor,
        ).not.toHaveBeenCalled()
    })

    it('should block the reply area because the customer is required on ticket creation with an internal-note', () => {
        const testProps = {
            ...minProps,
            newMessageType: TicketMessageSourceType.InternalNote,
            currentTicket: fromJS({ id: null, customer: null }),
        }
        const { container } = render(<TicketReplyArea {...testProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply macro on enter key down when there are macro search results', () => {
        const { container } = render(
            <TicketReplyArea
                {...minProps}
                macros={macros}
                hasShownMacros
                isMacrosActive
            />,
        )
        const input = getByTestId(container, 'ticket-macro-search')
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })

    it('should not apply macro on enter key down when macro search results are empty', () => {
        const { container } = render(
            <TicketReplyArea {...minProps} hasShownMacros isMacrosActive />,
        )
        const input = getByTestId(container, 'ticket-macro-search')
        fireEvent.keyDown(input, { key: 'Enter' })

        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })

    it('should update selected macro id', () => {
        const [first, ...data] = macros
        const macrosWithScore = [
            { ...first, score: 1, relevance_rank: 1 },
            ...data,
        ]
        const { rerender } = render(
            <TicketReplyArea {...minProps} macros={macrosWithScore} />,
        )
        rerender(
            <TicketReplyArea
                {...minProps}
                macros={macrosWithScore}
                isMacrosLoading
            />,
        )
    })

    describe('Shift+Tab keyboard shortcut', () => {
        it('should show macros and focus macro search input when Shift+Tab is pressed', () => {
            const onChangeMacrosActive = jest.fn()
            const { container } = render(
                <TicketReplyArea
                    {...minProps}
                    onChangeMacrosActive={onChangeMacrosActive}
                />,
            )

            const macroInput = getByTestId(container, 'ticket-macro-search')
            const focusSpy = jest.spyOn(macroInput, 'focus')

            const onKeyDown = (TicketReply as any).mocks.getCapturedOnKeyDown()
            onKeyDown({ shiftKey: true, key: 'Tab' })

            expect(onChangeMacrosActive).toHaveBeenCalledWith(true)
            expect(focusSpy).toHaveBeenCalled()
        })

        it('should not show macros when Tab is pressed without Shift', () => {
            const onChangeMacrosActive = jest.fn()
            render(
                <TicketReplyArea
                    {...minProps}
                    onChangeMacrosActive={onChangeMacrosActive}
                />,
            )

            const onKeyDown = (TicketReply as any).mocks.getCapturedOnKeyDown()
            onKeyDown({ shiftKey: false, key: 'Tab' })

            expect(onChangeMacrosActive).not.toHaveBeenCalled()
        })
    })

    describe('SEARCH_MACROS keyboard shortcut', () => {
        it('should call preventDefault and show macros when triggered', () => {
            const onChangeMacrosActive = jest.fn()
            render(
                <TicketReplyArea
                    {...minProps}
                    onChangeMacrosActive={onChangeMacrosActive}
                />,
            )

            const shortcutEvent = {
                preventDefault: jest.fn(),
            } as unknown as jest.Mocked<Event>

            makeExecuteKeyboardAction(
                shortcutManagerMock,
                shortcutEvent,
                'TicketDetailContainer',
            )('SEARCH_MACROS')

            expect(shortcutEvent.preventDefault).toHaveBeenCalled()
            expect(onChangeMacrosActive).toHaveBeenCalledWith(true)
        })
    })

    describe('prefill macro alert', () => {
        it('should not prefill macro if rule suggestion is displayed', async () => {
            const { rerender } = render(
                <Provider store={mockedStore({})}>
                    <TicketReplyArea
                        {...minProps}
                        inTicketSuggestionState="pending"
                    />
                </Provider>,
            )

            const macros = [
                {
                    actions: [],
                    category: null,
                    created_datetime: '',
                    external_id: null,
                    id: 1,
                    language: 'en' as Language,
                    name: 'Macro 1',
                    relevance_rank: 1,
                    score: 0.99,
                    updated_datetime: '',
                    uri: '',
                    usage: 0,
                },
            ]

            rerender(
                <Provider store={mockedStore({})}>
                    <TicketReplyArea
                        {...minProps}
                        inTicketSuggestionState="pending"
                        macros={macros}
                    />
                </Provider>,
            )

            await waitFor(() => {
                expect(minProps.applyMacro).not.toHaveBeenCalled()
            })
        })
    })
})

import React, {ComponentProps} from 'react'
import {fromJS} from 'immutable'
import {fireEvent, getByTestId, render, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {ContentState} from 'draft-js'

import {TicketMessageSourceType} from 'business/types/ticket'
import {macros} from 'fixtures/macro'

import TicketMacrosSearch from '../TicketMacrosSearch'
import TicketReply from '../TicketReply'
import {TicketReplyArea} from '../TicketReplyArea'

const mockedStore = configureMockStore([thunk])

type Props = {
    richAreaRef: (value: any) => void
}

jest.mock('pages/common/components/MacroFilters/MacroFilters', () => () => (
    <div>MacroFilters</div>
))

jest.mock('../TicketReply', () => {
    const {Component} = jest.requireActual('react')
    const focusEditor = jest.fn()

    class TicketReplyMock extends Component<Props> {
        focusEditor = focusEditor
        isFocused = jest.fn().mockReturnValue(false)

        render() {
            const {richAreaRef}: Props = this.props
            richAreaRef(this)

            return <div>hello</div>
        }
    }
    TicketReplyMock.mocks = {
        focusEditor,
    }

    return TicketReplyMock
})

type TicketMacrosMockProps = {
    onClearMacro: () => void
}

jest.mock('../TicketMacros', () => ({onClearMacro}: TicketMacrosMockProps) => (
    <div>
        TicketMacros mock
        <button className="clear-macro" onClick={onClearMacro}>
            clear mocks
        </button>
    </div>
))

jest.mock(
    '../TicketMacrosSearch',
    () =>
        ({
            showMacros,
            handleSearchKeyDown,
        }: ComponentProps<typeof TicketMacrosSearch>) => (
            <input
                data-testid="ticket-macro-search"
                onKeyDown={handleSearchKeyDown}
                onFocus={() => showMacros()}
            />
        )
)

const minProps = {
    ticket: fromJS({}),
    currentUser: fromJS({}),
    lastMessage: fromJS({id: 10}),
    customers: {},
    preferences: fromJS({}),
    newMessage: fromJS({
        contentState: null,
        newMessage: {body_text: 'Hello world'},
    }),
    newMessageType: TicketMessageSourceType.Email,
    notify: () => Promise.resolve,
    currentMacro: {},
    page: 1,
    totalPages: 1,
    selectMacro: jest.fn(),
    fetchMacrosCancellable: () => Promise.resolve(),
    applyMacro: jest.fn(),
    currentTicket: fromJS({
        id: 1,
        messages: [{id: 1}],
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
} as unknown as ComponentProps<typeof TicketReplyArea>

describe('<TicketReplyArea/>', () => {
    it('should render', () => {
        const {container} = render(<TicketReplyArea {...minProps} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it("should hide macros when newMessageType becomes 'internal-note'", () => {
        const props = {...minProps, hasShownMacros: true, isMacrosActive: true}
        const {queryByText, rerender} = render(<TicketReplyArea {...props} />)

        expect(queryByText(/TicketMacros mock/i)).toBeInTheDocument()

        rerender(
            <TicketReplyArea
                {...props}
                newMessageType={TicketMessageSourceType.InternalNote}
            />
        )

        expect(minProps.onChangeMacrosActive).toHaveBeenCalledWith(false)

        rerender(
            <TicketReplyArea
                {...props}
                newMessageType={TicketMessageSourceType.InternalNote}
                isMacrosActive={false}
            />
        )
        expect(queryByText(/TicketMacros mock/i)).not.toBeInTheDocument()
    })

    it('should hide macros when editor has text', () => {
        const props = {...minProps, hasShownMacros: true, isMacrosActive: true}
        const {queryByText, rerender} = render(<TicketReplyArea {...props} />)

        expect(queryByText(/TicketMacros mock/i)).toBeInTheDocument()

        rerender(
            <TicketReplyArea
                {...props}
                newMessage={fromJS({
                    state: {contentState: ContentState.createFromText('test')},
                    newMessage: {body_text: 'test'},
                })}
            />
        )
        expect(minProps.onChangeMacrosActive).toHaveBeenCalledWith(false)

        rerender(
            <TicketReplyArea
                {...props}
                newMessage={fromJS({
                    state: {contentState: ContentState.createFromText('test')},
                    newMessage: {body_text: 'test'},
                })}
                isMacrosActive={false}
            />
        )
        expect(queryByText(/'TicketMacros mock'/i)).not.toBeInTheDocument()
    })

    it("should not focus editor when newMessageType becomes 'internal-note'", () => {
        const {rerender} = render(<TicketReplyArea {...minProps} />)
        rerender(
            <TicketReplyArea
                {...minProps}
                newMessageType={TicketMessageSourceType.InternalNote}
            />
        )

        expect(
            (
                TicketReply as unknown as {
                    mocks: {focusEditor: jest.MockedFunction<any>}
                }
            ).mocks.focusEditor
        ).not.toHaveBeenCalled()
    })

    it('should block the reply area because the customer is required on ticket creation with an internal-note', () => {
        const testProps = {
            ...minProps,
            newMessageType: TicketMessageSourceType.InternalNote,
            currentTicket: fromJS({id: null, customer: null}),
        }
        const {container} = render(<TicketReplyArea {...testProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply macro on enter key down when there are macro search results', () => {
        const {container} = render(
            <TicketReplyArea
                {...minProps}
                macros={macros}
                hasShownMacros
                isMacrosActive
            />
        )
        const input = getByTestId(container, 'ticket-macro-search')
        fireEvent.keyDown(input, {key: 'Enter'})

        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })

    it('should not apply macro on enter key down when macro search results are empty', () => {
        const {container} = render(
            <TicketReplyArea {...minProps} hasShownMacros isMacrosActive />
        )
        const input = getByTestId(container, 'ticket-macro-search')
        fireEvent.keyDown(input, {key: 'Enter'})

        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })

    describe('prefill macro alert', () => {
        it('should not prefill macro if rule suggestion is displayed', async () => {
            const {rerender} = render(
                <Provider store={mockedStore({})}>
                    <TicketReplyArea
                        {...minProps}
                        inTicketSuggestionState="pending"
                    />
                </Provider>
            )

            const macros = [
                {
                    actions: [],
                    category: null,
                    created_datetime: '',
                    external_id: null,
                    id: 1,
                    language: 'en',
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
                </Provider>
            )

            await waitFor(() => {
                expect(minProps.applyMacro).not.toHaveBeenCalled()
            })
        })
    })
})

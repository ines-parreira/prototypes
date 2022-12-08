import React, {ComponentProps} from 'react'
import {shallow, mount, ReactWrapper} from 'enzyme'
import {fromJS} from 'immutable'
import {waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {FeatureFlagKey} from 'config/featureFlags'
import {Macro} from 'state/macro/types'
import TicketReply from '../TicketReply'
import {TicketReplyArea} from '../TicketReplyArea'
import TicketMacros from '../TicketMacros'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

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
} as unknown as ComponentProps<typeof TicketReplyArea>

function focusMacroInput(component: ReactWrapper<any>) {
    component.find('input').simulate('focus')
}

describe('<TicketReplyArea/>', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const component = shallow(<TicketReplyArea {...minProps} />)

        expect(component).toMatchSnapshot()
    })

    it("should hide macros when newMessageType becomes 'internal-note'", () => {
        const component = mount(<TicketReplyArea {...minProps} />)

        focusMacroInput(component)
        expect(component.find(TicketMacros)).toHaveLength(1)
        component.setProps({
            newMessageType: TicketMessageSourceType.InternalNote,
        })
        component.update()
        expect(component.find(TicketMacros)).toHaveLength(0)
    })

    it("should not focus editor when newMessageType becomes 'internal-note'", () => {
        const component = mount(<TicketReplyArea {...minProps} />)

        component.setProps({
            newMessageType: TicketMessageSourceType.InternalNote,
        })
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
        const component = mount(<TicketReplyArea {...testProps} />)
        expect(component).toMatchSnapshot()
    })

    it('should not apply macro on enter key down when macro search results are empty', () => {
        const component = mount(<TicketReplyArea {...minProps} />)
        focusMacroInput(component)
        component.find('input').simulate('keyDown', {key: 'Enter'})
        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })

    describe('prefill macro alert', () => {
        it.each([
            [
                [
                    {
                        id: 1,
                        external_id: null,
                        name: 'Macro 1',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 1,
                        score: 0.99,
                    },
                    {
                        id: 2,
                        external_id: null,
                        name: 'Macro 2',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 2,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        id: 1,
                        external_id: null,
                        name: 'Macro 1',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 1,
                        score: 0.99,
                    },
                    {
                        id: 2,
                        external_id: null,
                        name: 'Macro 2',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 2,
                    },
                    {
                        id: 3,
                        external_id: null,
                        name: 'Macro 3',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 0,
                        score: 0.29,
                    },
                ],
                true,
            ],
            [
                [
                    {
                        id: 1,
                        external_id: null,
                        name: 'Macro 1',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 2,
                        score: 0.99,
                    },
                ],
                false,
            ],
            [
                [
                    {
                        id: 1,
                        external_id: null,
                        name: 'Macro 1',
                        intent: null,
                        language: 'en',
                        usage: 0,
                        actions: [],
                        relevance_rank: 1,
                        score: 0.5,
                    },
                ],
                false,
            ],
        ])(
            'should apply top one macro based on macros search results',
            async (macros, shouldApplyMacro) => {
                const component = mount(
                    <Provider store={mockedStore({})}>
                        <TicketReplyArea
                            {...minProps}
                            flags={{[FeatureFlagKey.PrefillBestMacro]: true}}
                        />
                    </Provider>
                )
                const ticketReplyArea = component.find('TicketReplyArea')
                ticketReplyArea.setState({
                    searchResults: fromJS(macros),
                })

                await waitFor(() => {
                    if (shouldApplyMacro) {
                        const topOneMacro = fromJS({
                            ...macros.find(
                                (macro) => macro.relevance_rank === 1
                            ),
                        }) as Macro
                        expect(minProps.applyMacro).toHaveBeenCalledWith(
                            topOneMacro,
                            minProps.currentTicket.get('id'),
                            true,
                            {macroId: topOneMacro.get('id'), state: 'pending'}
                        )
                    } else {
                        expect(minProps.applyMacro).not.toHaveBeenCalled()
                    }
                })
            }
        )

        it('should not prefill macro if rule suggestion is displayed', async () => {
            const macros = [
                {
                    id: 1,
                    external_id: null,
                    name: 'Macro 1',
                    intent: null,
                    language: 'en',
                    usage: 0,
                    actions: [],
                    relevance_rank: 1,
                    score: 0.99,
                },
            ]

            minProps.ruleSuggestionState = 'pending'

            const component = mount(
                <Provider store={mockedStore({})}>
                    <TicketReplyArea
                        {...minProps}
                        flags={{[FeatureFlagKey.PrefillBestMacro]: true}}
                    />
                </Provider>
            )
            const ticketReplyArea = component.find('TicketReplyArea')
            ticketReplyArea.setState({
                searchResults: fromJS(macros),
            })

            await waitFor(() => {
                expect(minProps.applyMacro).not.toHaveBeenCalled()
            })
        })
    })
})

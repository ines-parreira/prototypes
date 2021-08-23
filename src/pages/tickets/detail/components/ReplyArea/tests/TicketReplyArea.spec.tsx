import React, {ComponentProps} from 'react'
import {shallow, mount, ReactWrapper} from 'enzyme'
import {fromJS} from 'immutable'

import TicketReply from '../TicketReply'
import {TicketReplyArea} from '../TicketReplyArea'
import TicketMacros from '../TicketMacros'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket'

jest.mock('../TicketReply', () => {
    const {Component} = jest.requireActual('react')
    const focusEditor = jest.fn()

    class TicketReplyMock extends Component {
        focusEditor = focusEditor

        render() {
            const {richAreaRef} = this.props as {
                richAreaRef: (value: any) => void
            }
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

const minProps = ({
    ticket: fromJS({}),
    currentUser: fromJS({}),
    customers: {},
    preferences: fromJS({}),
    newMessage: {},
    newMessageType: TicketMessageSourceType.Email,
    notify: () => Promise.resolve,
    currentMacro: {},
    page: 1,
    totalPages: 1,
    selectMacro: jest.fn(),
    fetchMacrosCancellable: () => Promise.resolve(),
    applyMacro: jest.fn(),
    currentTicket: fromJS({}),
    cacheAdded: false,
} as unknown) as ComponentProps<typeof TicketReplyArea>

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
            ((TicketReply as unknown) as {
                mocks: {focusEditor: jest.MockedFunction<any>}
            }).mocks.focusEditor
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

    describe('_hideMacrosAndFocusEditor()', () => {
        it('should hide macros and focus editor when called', () => {
            const component = mount(<TicketReplyArea {...minProps} />)

            focusMacroInput(component)
            component.find('.clear-macro').simulate('click')
            expect(
                ((TicketReply as unknown) as {
                    mocks: {focusEditor: jest.MockedFunction<any>}
                }).mocks.focusEditor
            ).toHaveBeenNthCalledWith(1)
            expect(component).toMatchSnapshot()
        })
    })

    it('should not apply macro on enter key down when macro search results are empty', () => {
        const component = mount(<TicketReplyArea {...minProps} />)

        focusMacroInput(component)
        component.find('input').simulate('keyDown', {key: 'Enter'})

        expect(minProps.applyMacro).not.toHaveBeenCalled()
    })
})

import React from 'react'
import {shallow} from 'enzyme'
import {Map, fromJS} from 'immutable'

import {ACTION_TEMPLATES} from 'config'
import {MacroActionName} from 'models/macroAction/types'
import {TicketSubmitButtonsContainer} from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array: unknown[]) => array[0])

describe('TicketSubmitButtons component', () => {
    const minNewMessage = {
        _internal: {
            loading: {
                submitMessage: false,
            },
        },
    }

    const createTicket = (actionNames: string[]) => {
        const actions = actionNames.map(
            (name) => ACTION_TEMPLATES.find((action) => action.name === name)!
        )
        return fromJS({state: {appliedMacro: {actions}}}) as Map<any, any>
    }

    const ticketWithMacro = createTicket([MacroActionName.AddInternalNote])
    const ticketWithSetResponseTextAndAddAttachements = createTicket([
        MacroActionName.SetResponseText,
        MacroActionName.AddAttachments,
    ])
    const ticketWithSubject = createTicket([MacroActionName.SetSubject])

    const minProps = {
        submit: () => null,
        ticket: fromJS({}),
        isAccountActive: true,
        hasRecipientsOrPrivate: true,
        hasContent: true,
        currentUserPreferences: fromJS({}),
        isHidingTips: false,
        newMessage: fromJS(minNewMessage),
        submitSetting: jest.fn(),
    }

    it('should render buttons with a filled ticket', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer {...minProps} />
        )
        expect(component).toMatchSnapshot()
    })

    it('should render buttons with an empty ticket', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer {...minProps} hasContent={false} />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with no recipent and public', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasRecipientsOrPrivate={false}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with an Inactive account', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                isAccountActive={false}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with only macro applied', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                ticket={ticketWithMacro}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with only macro applied but only setResponseText && addAttachements', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                ticket={ticketWithSetResponseTextAndAddAttachements}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with ticket content & macro applied', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                ticket={ticketWithMacro}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should not render confirm popover', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                ticket={ticketWithSubject}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })
})

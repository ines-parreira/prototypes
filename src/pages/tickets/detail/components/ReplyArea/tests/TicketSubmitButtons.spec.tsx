import React, {ComponentProps} from 'react'
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

    const ticketWithSubject = createTicket([MacroActionName.SetSubject])

    const minProps: ComponentProps<typeof TicketSubmitButtonsContainer> = {
        submit: () => null,
        ticket: fromJS({}),
        isAccountActive: true,
        canSend: true,
        hasContentlessAction: false,
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
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                canSend={false}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it("should render buttons with content that can't be sent", () => {
        const component = shallow(
            <TicketSubmitButtonsContainer {...minProps} canSend={false} />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with contentless action', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                hasContentlessAction={true}
            />
        )
        expect(component.find('div.buttons')).toMatchSnapshot()
    })

    it('should render buttons with contentless action and message content', () => {
        const component = shallow(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContentlessAction={true}
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

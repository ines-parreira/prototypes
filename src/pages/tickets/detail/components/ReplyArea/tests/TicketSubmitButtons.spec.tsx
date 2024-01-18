import React, {ComponentProps, ReactElement} from 'react'
import {Map, fromJS} from 'immutable'

import {render} from '@testing-library/react'
import {ACTION_TEMPLATES} from 'config'
import {MacroActionName} from 'models/macroAction/types'
import ConfirmButton from 'pages/common/components/button/ConfirmButton'
import {TicketSubmitButtonsContainer} from '../TicketSubmitButtons'

jest.mock('lodash/sample', () => (array: unknown[]) => array[0])
jest.mock('pages/common/components/button/ConfirmButton')

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
        ticket: fromJS({}),
        isAccountActive: true,
        canSend: true,
        hasContentlessAction: false,
        hasContent: true,
        currentUserPreferences: fromJS({}),
        isHidingTips: false,
        newMessage: fromJS(minNewMessage),
        setTicketStatus: jest.fn(),
        submitSetting: jest.fn(),
    }

    beforeEach(() => {
        ;(
            ConfirmButton as jest.MockedFunction<typeof ConfirmButton>
        ).mockImplementation(
            (props) =>
                jest
                    .requireActual<Record<string, typeof ConfirmButton>>(
                        'pages/common/components/button/ConfirmButton'
                    )
                    .default(props) as ReactElement
        )
    })

    it('should render buttons with a filled ticket', () => {
        const {container} = render(
            <TicketSubmitButtonsContainer {...minProps} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render buttons with an empty ticket', () => {
        const {getByText} = render(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                canSend={false}
            />
        )
        expect(getByText('Send & Close').getAttribute('aria-disabled')).toBe(
            'true'
        )
        expect(getByText('Send').getAttribute('aria-disabled')).toBe('true')
    })

    it("should render buttons with content that can't be sent", () => {
        const {getByText} = render(
            <TicketSubmitButtonsContainer {...minProps} canSend={false} />
        )
        expect(getByText('Send & Close').getAttribute('aria-disabled')).toBe(
            'true'
        )
        expect(getByText('Send').getAttribute('aria-disabled')).toBe('true')
    })

    it('should render buttons with contentless action', () => {
        const {getByText} = render(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContent={false}
                hasContentlessAction={true}
            />
        )

        expect(getByText('Apply Macro')).toBeInTheDocument()
        expect(getByText('Apply Macro & Close')).toBeInTheDocument()
    })

    it('should render buttons with contentless action and message content', () => {
        const {getByText} = render(
            <TicketSubmitButtonsContainer
                {...minProps}
                hasContentlessAction={true}
            />
        )
        expect(getByText('Send & Close')).toBeInTheDocument()
        expect(getByText('Send')).toBeInTheDocument()
    })

    it('should not render confirm popover', () => {
        ;(
            ConfirmButton as jest.MockedFunction<typeof ConfirmButton>
        ).mockImplementationOnce(() => <div>ConfirmButton</div>)

        const {queryByText} = render(
            <TicketSubmitButtonsContainer
                {...minProps}
                ticket={ticketWithSubject}
            />
        )
        expect(queryByText('ConfirmButton')).not.toBeInTheDocument()
    })
})

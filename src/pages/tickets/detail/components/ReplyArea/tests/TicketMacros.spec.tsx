import React from 'react'
import {render} from '@testing-library/react'
import {fromJS, List, Map} from 'immutable'

import {TicketMacrosContainer} from '../TicketMacros'
import {user} from '../../../../../../fixtures/users'
import {TicketMessageSourceType} from '../../../../../../business/types/ticket'
import {UserRole} from '../../../../../../config/types/user'

jest.mock('../../../../common/macros/components/MacroNoResults', () => () =>
    'No macros found'
)
jest.mock('../../../../common/macros/components/MacroList', () => () =>
    'Macro list'
)

describe('<TicketMacros />', () => {
    const minProps = {
        currentUser: fromJS(user) as Map<any, any>,
        currentMacro: fromJS({}),
        newMessageType: TicketMessageSourceType.Email,
        fetchMacros: jest.fn(),
        isInitialMacrosLoading: false,
        page: 1,
        totalPages: 1,
        deleteMacro: jest.fn(),
        applyMacro: jest.fn(),
        notify: jest.fn(),
        onClearMacro: jest.fn(),
        selectMacro: jest.fn(),
    }

    const macros: List<any> = fromJS([
        {
            id: 1,
            name: 'Refund my order',
            actions: [
                {
                    name: 'setResponseText',
                },
                {
                    name: 'addAttachments',
                },
            ],
        },
        {
            id: 2,
            name: 'Order my refund',
            actions: [],
        },
    ])

    it("should display an empty state if there's no macros", () => {
        const {getByText} = render(<TicketMacrosContainer {...minProps} />)

        expect(getByText('No macros found')).toBeTruthy()
    })

    it('should display macros list, and selected macro', () => {
        const {container} = render(
            <TicketMacrosContainer
                {...minProps}
                macros={macros}
                currentMacro={macros.get(1)}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should not display the edition dropdown when the user is observer, lite or basic agent', () => {
        const {queryByText} = render(
            <TicketMacrosContainer
                {...minProps}
                currentUser={minProps.currentUser.setIn(
                    ['roles', 0, 'name'],
                    UserRole.BasicAgent
                )}
                macros={macros}
            />
        )

        expect(queryByText('settings')).toBeNull()
    })
})

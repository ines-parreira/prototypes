import React, {ComponentProps} from 'react'
import {fromJS, List} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {user} from 'fixtures/users'
import {logEvent} from 'store/middlewares/segmentTracker'

import {MacroListContainer} from '../MacroList'

jest.mock('../../../../../../store/middlewares/segmentTracker.ts')
const logEventMock = logEvent as jest.Mock

describe('MacroList component', () => {
    const macros: List<any> = fromJS([
        {id: 1, name: 'Pizza Pepperoni'},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])

    const minProps: ComponentProps<typeof MacroListContainer> = {
        macros: macros,
        currentMacro: macros.first(),
        onClickItem: jest.fn(),
        onHoverItem: jest.fn(),
        search: '',
        page: 1,
        totalPages: 1,
        fetchMacros: jest.fn(),
        currentUser: fromJS({}),
        dispatch: jest.fn(),
    }
    it('should render the macro list', () => {
        const {container} = render(<MacroListContainer {...minProps} />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render active and disabled macros', () => {
        const {container} = render(
            <MacroListContainer
                {...minProps}
                currentMacro={macros.get(1)}
                disableExternalActions={true}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should send event to segment on send', () => {
        const {getAllByText} = render(
            <MacroListContainer
                {...minProps}
                currentMacro={macros.get(1)}
                disableExternalActions={true}
                currentUser={fromJS(user)}
            />
        )
        fireEvent.click(getAllByText('Pizza Capricciosa')[0])
        expect(logEventMock.mock.calls).toMatchSnapshot()
    })
})

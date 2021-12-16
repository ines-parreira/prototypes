import React from 'react'
import {fromJS} from 'immutable'
import {render, fireEvent} from '@testing-library/react'

import {MacroListContainer} from '../MacroList.tsx'
import {user} from '../../../../../../fixtures/users.ts'
import {logEvent} from '../../../../../../store/middlewares/segmentTracker.ts'

jest.mock('../../../../../../store/middlewares/segmentTracker.ts')

describe('MacroList component', () => {
    const macros = fromJS([
        {id: 1, name: 'Pizza Pepperoni'},
        {id: 2, name: 'Pizza Capricciosa'},
        {
            id: 3,
            name: 'Pizza Margherita',
            actions: [{name: 'http'}],
        },
    ])

    it('should render the macro list', () => {
        const {container} = render(
            <MacroListContainer macros={macros} currentMacro={macros.first()} />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render active and disabled macros', () => {
        const {container} = render(
            <MacroListContainer
                macros={macros}
                currentMacro={macros.get(1)}
                disableExternalActions={true}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should send event to segment on send', () => {
        const {getAllByText} = render(
            <MacroListContainer
                macros={macros}
                currentMacro={macros.get(1)}
                disableExternalActions={true}
                currentUser={fromJS(user)}
            />
        )
        fireEvent.click(getAllByText('Pizza Capricciosa')[0])
        expect(logEvent.mock.calls).toMatchSnapshot()
    })
})

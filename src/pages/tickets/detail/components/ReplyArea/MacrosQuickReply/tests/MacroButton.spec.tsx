import React, {ComponentProps} from 'react'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import {StoreDispatch, RootState} from '../../../../../../../state/types'
import {MacroButton} from '../MacroButton'

import {setTextAction, macroFixture} from '../../../../../../../fixtures/macro'
jest.mock('draft-js/lib/generateRandomKey', () => () => '42')

jest.mock('pages/tickets/common/macros/Preview', () => () => <>Preview</>)

const applyMacro = jest.fn()
const onHover = jest.fn()

const minProps: ComponentProps<typeof MacroButton> = {
    macro: macroFixture,
    applyMacro,
    onHover: onHover,
}

describe('<MacroButton />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])
    let store = mockStore({})

    beforeEach(() => {
        store = mockStore({})
    })

    it('should render the button', () => {
        const {container} = render(
            <Provider store={store}>
                <MacroButton {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should apply macro on click', () => {
        const {getByRole} = render(
            <Provider store={store}>
                <MacroButton {...minProps} />
            </Provider>
        )
        fireEvent.click(getByRole('button'))
        expect(applyMacro).toHaveBeenCalled()
    })

    it('should open the popover on hover', () => {
        const {baseElement, getByRole} = render(
            <Provider store={store}>
                <MacroButton
                    {...minProps}
                    macro={{...macroFixture, actions: [setTextAction]}}
                />
            </Provider>
        )
        fireEvent.mouseEnter(getByRole('button'))
        expect(baseElement.children[1]).toMatchSnapshot()
        expect(onHover).toHaveBeenCalled()
    })
})

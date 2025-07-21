import React, { ComponentProps } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import useAppSelector from 'hooks/useAppSelector'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'

import ApplyMacro from '../ApplyMacro'

const mockStore = configureMockStore([thunk])

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

const mockItemsIds = fromJS([])
jest.mock(
    'pages/tickets/common/macros/MacroContainer',
    () =>
        ({ onComplete, closeModal }: ComponentProps<typeof MacroContainer>) => (
            <div>
                MacroContainerMock
                <div onClick={closeModal}>closeModal</div>
                <div onClick={() => onComplete?.(mockItemsIds)}>onComplete</div>
            </div>
        ),
)

describe('<ApplyMacro />', () => {
    const minProps = {
        onApplyMacro: jest.fn(),
        setIsOpen: jest.fn(),
        ticketIds: [],
    }

    beforeEach(() => {
        useAppSelectorMock.mockReturnValue(fromJS({}))
    })

    it('should open and close macro container', () => {
        const { getByText } = render(
            <Provider store={mockStore({})}>
                <ApplyMacro {...minProps} />
            </Provider>,
        )

        expect(getByText('MacroContainerMock')).toBeInTheDocument()
        fireEvent.click(getByText('closeModal'))
        expect(minProps.setIsOpen).toHaveBeenCalledWith(false)
    })

    it('should clear selected tickets once `apply macro` bulk action is applied', () => {
        const { getByText } = render(
            <Provider store={mockStore({})}>
                <ApplyMacro {...minProps} />
            </Provider>,
        )
        fireEvent.click(getByText('onComplete'))

        expect(minProps.onApplyMacro).toHaveBeenCalledWith(mockItemsIds)
    })
})

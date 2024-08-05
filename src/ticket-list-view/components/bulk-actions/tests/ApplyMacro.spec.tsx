import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'

import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import MacroContainer from 'pages/tickets/common/macros/MacroContainer'

import ApplyMacro from '../ApplyMacro'

const mockStore = configureMockStore([thunk])

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch')
const useAppDispatchMock = useAppDispatch as jest.Mock

jest.mock('hooks/useAppSelector')
const useAppSelectorMock = useAppSelector as jest.Mock

const mockItemsIds = fromJS([])
jest.mock(
    'pages/tickets/common/macros/MacroContainer',
    () =>
        ({onComplete, closeModal}: ComponentProps<typeof MacroContainer>) =>
            (
                <div>
                    MacroContainer
                    <div onClick={closeModal}>closeModal</div>
                    <div onClick={() => onComplete?.(mockItemsIds)}>
                        onComplete
                    </div>
                </div>
            )
)

describe('<ApplyMacro />', () => {
    const minProps = {
        onComplete: jest.fn(),
        ticketIds: [],
    }

    beforeEach(() => {
        useAppDispatchMock.mockReturnValue(mockedDispatch)
        useAppSelectorMock.mockReturnValue(fromJS({}))
    })

    it('should render', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <ApplyMacro {...minProps} />
            </Provider>
        )

        expect(getByText('bolt')).toBeInTheDocument()
    })

    it('should open and close macro container', () => {
        const {getByText, queryByText} = render(
            <Provider store={mockStore({})}>
                <ApplyMacro {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText('bolt'))

        expect(getByText('MacroContainer')).toBeInTheDocument()
        fireEvent.click(getByText('closeModal'))
        expect(queryByText('MacroContainer')).not.toBeInTheDocument()
    })

    it('should clear selected tickets once `apply macro` bulk action is applied', () => {
        const {getByText} = render(
            <Provider store={mockStore({})}>
                <ApplyMacro {...minProps} />
            </Provider>
        )
        fireEvent.click(getByText('bolt'))
        fireEvent.click(getByText('onComplete'))

        expect(minProps.onComplete).toHaveBeenCalledWith(mockItemsIds)
    })
})

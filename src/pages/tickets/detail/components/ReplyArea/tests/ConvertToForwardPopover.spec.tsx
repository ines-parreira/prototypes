import React, {useEffect, useRef, useState} from 'react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'
import {fireEvent, render} from '@testing-library/react'
import {fromJS} from 'immutable'

import {setShowConvertToForwardPopover} from 'state/newMessage/actions'

import {RootState, StoreDispatch} from 'state/types'

import ConvertToForwardPopover from '../ConvertToForwardPopover'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const Wrapper = () => {
    const target = useRef<HTMLDivElement>(null)
    const [showPopover, setShowPopover] = useState(false)

    useEffect(() => {
        setShowPopover(true)
    }, [])

    return (
        <>
            <div ref={target}></div>
            {showPopover && <ConvertToForwardPopover target={target} />}
        </>
    )
}

describe('<ConvertToForwardPopover/>', () => {
    const makeStore = (showConvertToForwardPopover: boolean) =>
        mockStore({
            newMessage: fromJS({
                state: {
                    showConvertToForwardPopover,
                },
            }),
        })

    it('should render popover', () => {
        const {baseElement} = render(
            <Provider store={makeStore(true)}>
                <Wrapper />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it('should not render popover', () => {
        const {baseElement} = render(
            <Provider store={makeStore(false)}>
                <Wrapper />
            </Provider>
        )
        expect(baseElement).toMatchSnapshot()
    })

    it.each([['Understood'], ['Change To Forward']])(
        'button "%s" should close popover',
        (label) => {
            const store = makeStore(true)

            const {getByText} = render(
                <Provider store={store}>
                    <Wrapper />
                </Provider>
            )

            fireEvent.click(getByText(label))

            expect(store.getActions()[0]).toMatchObject(
                setShowConvertToForwardPopover(false)
            )
        }
    )
})

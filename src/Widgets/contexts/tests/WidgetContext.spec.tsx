import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import React, {memo, useContext} from 'react'

import {WidgetContextProvider, WidgetContext} from '../WidgetContext'

describe('WidgetContextProvider', () => {
    it('should stabilize the widget object in context to reduce child renders if possible', () => {
        const spy = jest.fn()
        const Spy = memo(() => {
            useContext(WidgetContext)
            spy()
            return <div />
        })
        const widget = {
            id: 0,
        }
        const immutableWidget = fromJS(widget)
        const {rerender} = render(
            <WidgetContextProvider value={immutableWidget}>
                <Spy />
            </WidgetContextProvider>
        )

        rerender(
            <WidgetContextProvider value={immutableWidget}>
                <Spy />
            </WidgetContextProvider>
        )

        expect(spy).toHaveBeenCalledTimes(1)
    })
})

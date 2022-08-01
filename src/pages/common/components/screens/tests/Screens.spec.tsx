import React, {useContext} from 'react'
import {render} from '@testing-library/react'

import Screens, {ScreensContext} from '../Screens'

describe('<Screens />', () => {
    const MockSetActiveScreenComponent = () => {
        const context = useContext(ScreensContext)

        if (!context) {
            throw new Error('Component is used outside of Provider')
        }

        return <>{context.activeScreen}</>
    }

    it('should accept an active screen', () => {
        const {getByText} = render(
            <Screens activeScreen="artemis">
                <ScreensContext.Consumer>
                    {(context) => context && context.activeScreen}
                </ScreensContext.Consumer>
            </Screens>
        )

        expect(getByText(/artemis/)).toBeTruthy()
    })

    it('should set an active screen', () => {
        const {getByText} = render(
            <Screens activeScreen="foo">
                <MockSetActiveScreenComponent />
            </Screens>
        )

        expect(getByText(/foo/)).toBeTruthy()
    })
})

import {render} from '@testing-library/react'
import React from 'react'

import Screen from '../Screen'
import Screens from '../Screens'

describe('<Screen />', () => {
    it('should render', () => {
        const {container} = render(
            <Screens activeScreen="leto">
                <Screen name="artemis">Artemis</Screen>
                <Screen name="leto">Leto</Screen>
            </Screens>
        )

        expect(container).toMatchSnapshot()
    })

    it('should throw an error if not used inside a ScreensProvider', () => {
        expect(() => render(<Screen name="artemis" />)).toThrow()
    })
})

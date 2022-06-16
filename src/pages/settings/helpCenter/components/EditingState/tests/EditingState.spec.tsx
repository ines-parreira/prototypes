import React from 'react'
import {render} from '@testing-library/react'

import {EditingStateEnum} from 'pages/settings/helpCenter/constants'

import EditingState from '../EditingState'

describe('<EditingState />', () => {
    it('should match snapshot', () => {
        const stateArray = [
            EditingStateEnum.PUBLISHED,
            EditingStateEnum.UNSAVED,
            EditingStateEnum.SAVED,
        ]
        stateArray.forEach((state) => {
            const {container} = render(<EditingState state={state} />)

            expect(container).toMatchSnapshot()
        })
    })
})

import React from 'react'
import {render} from '@testing-library/react'

import DeactivatedViewMessage from '../DeactivatedViewMessage'

describe('<DeactivatedViewMessage/>', () => {
    describe('render()', () => {
        it('should render', () => {
            const {container} = render(<DeactivatedViewMessage />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

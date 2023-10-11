import {render} from '@testing-library/react'
import React from 'react'

import {CardHeaderStarPoints} from '../CardHeaderStarPoints'

describe('<CardHeaderStarPoints/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const {container} = render(<CardHeaderStarPoints value="555" />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

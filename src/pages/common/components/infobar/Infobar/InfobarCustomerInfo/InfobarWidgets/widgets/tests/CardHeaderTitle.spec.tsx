import {render} from '@testing-library/react'
import React from 'react'

import {CardHeaderTitle} from '../CardHeaderTitle'

describe('<CardHeaderTitle/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const {container} = render(
                <CardHeaderTitle>
                    <p>foo</p>
                </CardHeaderTitle>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

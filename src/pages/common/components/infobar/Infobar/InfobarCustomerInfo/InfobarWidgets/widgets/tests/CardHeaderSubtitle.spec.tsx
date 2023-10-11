import {render} from '@testing-library/react'
import React from 'react'

import {CardHeaderSubtitle} from '../CardHeaderSubtitle'

describe('<CardHeaderSubtitle/>', () => {
    describe('render()', () => {
        it('should render children', () => {
            const {container} = render(
                <CardHeaderSubtitle>
                    <p>foo</p>
                </CardHeaderSubtitle>
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

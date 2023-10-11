import {render} from '@testing-library/react'
import React from 'react'

import {CardHeaderYotpoRatingThumbs} from '../CardHeaderYotpoRatingThumbs'

describe('<CardHeaderYotpoRatingThumbs/>', () => {
    describe('render()', () => {
        it('should render children and green thumb', () => {
            const {container} = render(
                <CardHeaderYotpoRatingThumbs value="3" />
            )

            expect(container.firstChild).toMatchSnapshot()
        })

        it('should render children and red thumb', () => {
            const {container} = render(
                <CardHeaderYotpoRatingThumbs value="1" />
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

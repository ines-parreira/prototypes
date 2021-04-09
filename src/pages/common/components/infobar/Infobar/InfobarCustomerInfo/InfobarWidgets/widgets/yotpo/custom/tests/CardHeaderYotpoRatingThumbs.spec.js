import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoRatingThumbs} from '../CardHeaderYotpoRatingThumbs'

describe('<CardHeaderYotpoRatingThumbs/>', () => {
    describe('render()', () => {
        it('should render children and green thumb', () => {
            const component = shallow(
                <CardHeaderYotpoRatingThumbs>3</CardHeaderYotpoRatingThumbs>
            )

            expect(component).toMatchSnapshot()
        })

        it('should render children and red thumb', () => {
            const component = shallow(
                <CardHeaderYotpoRatingThumbs>1</CardHeaderYotpoRatingThumbs>
            )

            expect(component).toMatchSnapshot()
        })
    })
})

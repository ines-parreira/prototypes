import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoRatingThumbs} from '../CardHeaderYotpoRatingThumbs.tsx'

describe('<CardHeaderYotpoRatingThumbs/>', () => {
    describe('render()', () => {
        it('should render children and green thumb', () => {
            const component = shallow(<CardHeaderYotpoRatingThumbs value="3" />)

            expect(component).toMatchSnapshot()
        })

        it('should render children and red thumb', () => {
            const component = shallow(<CardHeaderYotpoRatingThumbs value="1" />)

            expect(component).toMatchSnapshot()
        })
    })
})

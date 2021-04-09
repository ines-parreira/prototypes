import React from 'react'
import {shallow} from 'enzyme'

import {CardHeaderYotpoReviewStatistics} from '../CardHeaderYotpoReviewStatistics'

describe('<CardHeaderYotpoReviewStatistics/>', () => {
    describe('render()', () => {
        it('should render children and chat bubble icon', () => {
            const component = shallow(
                <CardHeaderYotpoReviewStatistics>
                    3
                </CardHeaderYotpoReviewStatistics>
            )

            expect(component).toMatchSnapshot()
        })
    })
})

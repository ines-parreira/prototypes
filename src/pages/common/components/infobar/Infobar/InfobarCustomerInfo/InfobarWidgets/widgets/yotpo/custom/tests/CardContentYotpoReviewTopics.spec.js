import React from 'react'
import {shallow} from 'enzyme'

import {CardContentYotpoReviewTopics} from '../CardContentYotpoReviewTopics'

describe('<CardContentYotpoReviewTopics/>', () => {
    describe('render()', () => {
        it('should render children as a list of pills', () => {
            let topics = ['bread', 'test']
            const component = shallow(
                <CardContentYotpoReviewTopics>
                    {topics}
                </CardContentYotpoReviewTopics>
            )

            expect(component).toMatchSnapshot()
        })
    })
})

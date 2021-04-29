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
        it.each([null, undefined, []])(
            'should render correctly if children is empty/null',
            (topics) => {
                const component = shallow(
                    <CardContentYotpoReviewTopics>
                        {topics}
                    </CardContentYotpoReviewTopics>
                )

                expect(component).toMatchSnapshot()
            }
        )
    })
})

import {shallow} from 'enzyme'
import {fromJS} from 'immutable'
import React from 'react'

import ReviewStatistics from '../ReviewStatistics.tsx'

const TitleWrapper = ReviewStatistics().TitleWrapper
const AfterContent = ReviewStatistics().AfterContent

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render header total reviews', () => {
            const component = shallow(
                <TitleWrapper
                    source={fromJS({
                        total_reviews: 2,
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

describe('<AfterContent/>', () => {
    describe('render()', () => {
        it('should render top topics for reviews', () => {
            const component = shallow(
                <AfterContent
                    source={fromJS({
                        top_topics: ['food', 'stuff'],
                    })}
                />
            )

            expect(component).toMatchSnapshot()
        })
    })
})

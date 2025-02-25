import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import { reviewStatisticsCustomization } from '../ReviewStatistics'

const TitleWrapper = reviewStatisticsCustomization.TitleWrapper!
const AfterContent = reviewStatisticsCustomization.AfterContent!

describe('<TitleWrapper/>', () => {
    describe('render()', () => {
        it('should render header total reviews', () => {
            const { container } = render(
                <TitleWrapper
                    source={fromJS({
                        total_reviews: 2,
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

describe('<AfterContent/>', () => {
    describe('render()', () => {
        it('should render top topics for reviews', () => {
            const { container } = render(
                <AfterContent
                    source={fromJS({
                        top_topics: ['food', 'stuff'],
                    })}
                />,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it('should render top topics sections even with no data', () => {
            const { container } = render(<AfterContent source={fromJS({})} />)

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

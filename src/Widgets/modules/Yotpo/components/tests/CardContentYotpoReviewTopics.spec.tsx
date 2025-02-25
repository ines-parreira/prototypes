import React from 'react'

import { render } from '@testing-library/react'

import { CardContentYotpoReviewTopics } from '../CardContentYotpoReviewTopics'

describe('<CardContentYotpoReviewTopics/>', () => {
    describe('render()', () => {
        it('should render children as a list of pills', () => {
            const { container } = render(
                <CardContentYotpoReviewTopics>
                    {{ bread: 'bread', test: 'test' }}
                </CardContentYotpoReviewTopics>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
        it.each([null, undefined, {}])(
            'should render correctly if children is empty/null',
            (topics) => {
                const { container } = render(
                    <CardContentYotpoReviewTopics>
                        {topics}
                    </CardContentYotpoReviewTopics>,
                )

                expect(container.firstChild).toMatchSnapshot()
            },
        )
    })
})

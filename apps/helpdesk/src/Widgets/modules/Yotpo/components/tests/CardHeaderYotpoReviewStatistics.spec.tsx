import React from 'react'

import { render } from '@testing-library/react'

import { CardHeaderYotpoReviewStatistics } from '../CardHeaderYotpoReviewStatistics'

describe('<CardHeaderYotpoReviewStatistics/>', () => {
    describe('render()', () => {
        it('should render children and chat bubble icon', () => {
            const { container } = render(
                <CardHeaderYotpoReviewStatistics>
                    3
                </CardHeaderYotpoReviewStatistics>,
            )

            expect(container.firstChild).toMatchSnapshot()
        })
    })
})

import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import StatDifference from '../StatDifference'

describe('<StatDifference />', () => {
    const minProps: ComponentProps<typeof StatDifference> = {
        value: 0,
        label: 'Foo label',
    }

    it('should render null when percentage is not a number', () => {
        const {container} = render(<StatDifference {...minProps} value="bar" />)
        expect(container.firstChild).toBe(null)
    })

    it.each<[string, number, boolean | undefined]>([
        ['forward arrow and no color when percentage is 0', 0, undefined],
        [
            'upward arrow and no color when percentage is positive',
            10,
            undefined,
        ],
        [
            'downward arrow and no color when percentage is negative',
            -10,
            undefined,
        ],
        [
            'forward arrow and neutral color when percentage is 0 and more is better',
            0,
            true,
        ],
        [
            'upward arrow and positive color when percentage is positive and more is better',
            10,
            true,
        ],
        [
            'downward arrow and negative color when percentage is negative and more is better',
            -10,
            true,
        ],
        [
            'forward arrow and neutral color when percentage is 0 and more is not better',
            0,
            false,
        ],
        [
            'upward arrow and negative color when percentage is positive and more is not better',
            10,
            false,
        ],
        [
            'downward arrow and positive color when percentage is negative and more is not better',
            -10,
            false,
        ],
    ])('should render %s', (testName, percentage, moreIsBetter) => {
        const {container} = render(
            <StatDifference
                {...minProps}
                value={percentage}
                moreIsBetter={moreIsBetter}
            />
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

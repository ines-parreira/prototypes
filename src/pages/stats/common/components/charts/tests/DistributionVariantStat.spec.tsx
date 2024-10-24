import {render} from '@testing-library/react'
import React from 'react'

import DistributionVariantStat, {
    DistributionStatVariant,
} from '../DistributionVariantStat'

describe('DistributionVariantStat', () => {
    it('should render a distribution chart', () => {
        const {container} = render(
            <DistributionVariantStat
                minValue={1}
                maxValue={5}
                variant={DistributionStatVariant.Star}
                currentValue={2}
            />
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

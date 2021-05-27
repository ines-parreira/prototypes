import React from 'react'
import {render} from '@testing-library/react'

import {LegacyPlanBanner} from '../LegacyPlanBanner'

describe('<LegacyPlanBanner />', () => {
    it('should render a banner', () => {
        const {container} = render(<LegacyPlanBanner subscriptionEnd="test" />)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a banner without subscription end date', () => {
        const {container} = render(<LegacyPlanBanner subscriptionEnd="test" />)
        expect(container.firstChild).toMatchSnapshot()
    })
})

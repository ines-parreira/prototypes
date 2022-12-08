import React from 'react'
import {render} from '@testing-library/react'

import {LegacyPlanBanner} from '../LegacyPlanBanner'

describe('<LegacyPlanBanner />', () => {
    it.each([false, true])(
        'should render the legacy plan banner',
        (isCustomPrice) => {
            const {container} = render(
                <LegacyPlanBanner isCustomPrice={isCustomPrice} />
            )
            expect(container).toMatchSnapshot()
        }
    )
})

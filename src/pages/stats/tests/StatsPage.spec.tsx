import React from 'react'
import {render} from '@testing-library/react'

import StatsPage from '../StatsPage'

describe('StatsPage', () => {
    it('should render the title, children and filters', () => {
        const {container} = render(
            <StatsPage
                title="Foo"
                description="Foo statistic page"
                helpUrl="http://example.com"
                filters={<p>Filters</p>}
            >
                Children
            </StatsPage>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

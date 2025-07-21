import React from 'react'

import { render } from '@testing-library/react'

import StatsHelpIcon from 'domains/reporting/pages/common/components/StatsHelpIcon'

describe('<StatsHelpIcon />', () => {
    it('should render the help icon', () => {
        const { container } = render(
            <StatsHelpIcon id="foo" className="fooClassName" />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

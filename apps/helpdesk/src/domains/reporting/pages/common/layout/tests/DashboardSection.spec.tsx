import React from 'react'

import { render } from '@repo/testing'

import { DashboardSection } from 'domains/reporting/pages/common/layout/DashboardSection'

describe('<DashboardSection />', () => {
    it('should render the section', () => {
        const { container } = render(
            <DashboardSection title="title" titleExtra="titleExtra">
                DashboardSection
            </DashboardSection>,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

import {render, screen} from '@testing-library/react'

import React from 'react'

import {CustomReportSection} from 'pages/stats/custom-reports/CustomReportSection'
import {
    CustomReportChildType,
    CustomReportRowSchema,
    CustomReportSectionSchema,
} from 'pages/stats/custom-reports/types'

const CHILD_COMPONENT_CONTENT = 'some content'
const ChildComponent = () => <div>{CHILD_COMPONENT_CONTENT}</div>

describe('CustomReportSection', () => {
    it('renders correctly', () => {
        const row: CustomReportRowSchema = {
            type: CustomReportChildType.Row,
            children: [],
        }
        const section: CustomReportSectionSchema = {
            type: CustomReportChildType.Section,
            children: [row],
        }

        render(
            <CustomReportSection schema={section}>
                {<ChildComponent />}
            </CustomReportSection>
        )

        expect(screen.getByText(CHILD_COMPONENT_CONTENT)).toBeInTheDocument()
    })
})

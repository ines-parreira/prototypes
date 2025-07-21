import React from 'react'

import { render, screen } from '@testing-library/react'

import { DashboardsSection } from 'domains/reporting/pages/dashboards/DashboardsSection'
import {
    DashboardChildType,
    DashboardRowSchema,
    DashboardSectionSchema,
} from 'domains/reporting/pages/dashboards/types'

const CHILD_COMPONENT_CONTENT = 'some content'
const ChildComponent = () => <div>{CHILD_COMPONENT_CONTENT}</div>

describe('DashboardsSection', () => {
    it('renders correctly', () => {
        const row: DashboardRowSchema = {
            type: DashboardChildType.Row,
            children: [],
        }
        const section: DashboardSectionSchema = {
            type: DashboardChildType.Section,
            children: [row],
        }

        render(
            <DashboardsSection schema={section}>
                {<ChildComponent />}
            </DashboardsSection>,
        )

        expect(screen.getByText(CHILD_COMPONENT_CONTENT)).toBeInTheDocument()
    })
})

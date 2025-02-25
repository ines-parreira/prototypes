import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import AssigneeBodyCell from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/AssigneeBodyCell'

describe('<AssigneeBodyCell>', () => {
    it('should render assignee name', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <AssigneeBodyCell assignee={'John Doe'} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('John Doe')).toBeInTheDocument()
    })

    it('should render NOT_AVAILABLE_PLACEHOLDER when assignee is not provided', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <AssigneeBodyCell assignee={null} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})

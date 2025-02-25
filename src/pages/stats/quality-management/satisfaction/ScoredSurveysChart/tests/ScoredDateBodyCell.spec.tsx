import React from 'react'

import { render } from '@testing-library/react'

import { NOT_AVAILABLE_PLACEHOLDER } from 'pages/stats/common/utils'
import ScoredDateBodyCell from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredDateBodyCell'

describe('<ScoredDateBodyCell>', () => {
    it('should render formatted date', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <ScoredDateBodyCell
                            surveyScoredDate={'2025-02-16T09:27:09.000'}
                        />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('2/16/2025')).toBeInTheDocument()
    })

    it('should render NOT_AVAILABLE_PLACEHOLDER when no date provided', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <ScoredDateBodyCell surveyScoredDate={null} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText(NOT_AVAILABLE_PLACEHOLDER)).toBeInTheDocument()
    })
})

import React from 'react'

import { render } from '@testing-library/react'

import SurveyScoreBodyCell from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/SurveyScoreBodyCell'

describe('<SurveyScoreBodyCell>', () => {
    it('should render score', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <SurveyScoreBodyCell surveyScore={'5'} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('5')).toBeInTheDocument()
    })

    it('should render icon', () => {
        const { getByText } = render(
            <table>
                <tbody>
                    <tr>
                        <SurveyScoreBodyCell surveyScore={'5'} />
                    </tr>
                </tbody>
            </table>,
        )

        expect(getByText('star')).toBeInTheDocument()
    })
})

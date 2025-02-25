import React from 'react'

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import {
    ActivateCustomerSatisfactionSurveyTip,
    CONFIGURE_SATISFACTION_SURVEY_BUTTON,
    CSAT_CTA,
    SATISFACTION_SURVEYS_SETTINGS_PATH,
} from 'pages/stats/ActivateCustomerSatisfactionSurveyTip'

jest.mock('react-router-dom', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return jest.requireActual('react-router-dom')
})
describe('<ActivateCustomerSatisfactionSurveyTip />', () => {
    it('should render a message with a link', () => {
        render(
            <MemoryRouter>
                <ActivateCustomerSatisfactionSurveyTip />
            </MemoryRouter>,
        )

        screen.getByRole('button', {
            name: CONFIGURE_SATISFACTION_SURVEY_BUTTON,
        })

        expect(screen.getByRole('link')).toHaveAttribute(
            'href',
            SATISFACTION_SURVEYS_SETTINGS_PATH,
        )
        expect(screen.getByText(CSAT_CTA)).toBeInTheDocument()
    })
})

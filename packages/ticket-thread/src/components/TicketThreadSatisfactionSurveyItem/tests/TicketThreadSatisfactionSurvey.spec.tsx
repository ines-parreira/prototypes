import { screen } from '@testing-library/react'

import type { TicketThreadSatisfactionSurveyItem } from '../../../hooks/satisfaction-survey/types'
import { TicketThreadItemTag } from '../../../hooks/types'
import { render } from '../../../tests/render.utils'
import { TicketThreadSatisfactionSurvey } from '../TicketTheadSatisfactionSurvey'

const satisfactionSurveyData = { score: 5 }

describe('TicketThreadSatisfactionSurvey', () => {
    it('renders a satisfaction survey item', () => {
        render(
            <TicketThreadSatisfactionSurvey
                item={
                    {
                        _tag: TicketThreadItemTag.SatisfactionSurvey,
                        data: satisfactionSurveyData,
                        datetime: '2024-03-21T11:00:00Z',
                    } as TicketThreadSatisfactionSurveyItem
                }
            />,
        )

        expect(
            screen.getByText(JSON.stringify(satisfactionSurveyData)),
        ).toBeInTheDocument()
    })
})

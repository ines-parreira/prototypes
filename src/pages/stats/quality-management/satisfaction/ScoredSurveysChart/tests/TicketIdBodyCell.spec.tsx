import {render} from '@testing-library/react'
import React from 'react'

import TicketIdBodyCell from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/TicketIdBodyCell'

describe('<TicketIdBodyCell>', () => {
    it('should render link', () => {
        const {container} = render(
            <table>
                <tbody>
                    <tr>
                        <TicketIdBodyCell ticketId={'123'} />
                    </tr>
                </tbody>
            </table>
        )

        const link = container.querySelector('a')

        expect(link).toBeInTheDocument()
        expect(link?.getAttribute('to')).toEqual(
            '/app/ticket/123#satisfactionSurvey'
        )
    })

    it('should open in new tab', () => {
        const {getByRole} = render(
            <table>
                <tbody>
                    <tr>
                        <TicketIdBodyCell ticketId={'123'} />
                    </tr>
                </tbody>
            </table>
        )

        const link = getByRole('link')

        expect(link?.getAttribute('to')).toEqual(
            '/app/ticket/123#satisfactionSurvey'
        )
        expect(link?.getAttribute('target')).toEqual('_blank')
        expect(link?.getAttribute('rel')).toEqual('noopener noreferrer')
    })

    it('should render icon', () => {
        const {getByText} = render(
            <table>
                <tbody>
                    <tr>
                        <TicketIdBodyCell ticketId={'123'} />
                    </tr>
                </tbody>
            </table>
        )

        const icon = getByText('open_in_new')

        expect(icon.tagName).toBe('I')
        expect(icon).toBeInTheDocument()
    })
})

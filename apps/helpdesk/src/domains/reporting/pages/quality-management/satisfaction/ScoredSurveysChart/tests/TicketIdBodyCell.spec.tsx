import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import TicketIdBodyCell from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/TicketIdBodyCell'

describe('<TicketIdBodyCell>', () => {
    it('should render link', () => {
        const { container } = render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <tr>
                            <TicketIdBodyCell ticketId={'123'} />
                        </tr>
                    </tbody>
                </table>
            </MemoryRouter>,
        )

        const link = container.querySelector('a')

        expect(link).toBeInTheDocument()
        expect(link?.getAttribute('href')).toEqual(
            '/app/ticket/123#satisfactionSurvey',
        )
    })

    it('should open in new tab', () => {
        const { getByRole } = render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <tr>
                            <TicketIdBodyCell ticketId={'123'} />
                        </tr>
                    </tbody>
                </table>
            </MemoryRouter>,
        )

        const link = getByRole('link')

        expect(link?.getAttribute('href')).toEqual(
            '/app/ticket/123#satisfactionSurvey',
        )
        expect(link?.getAttribute('target')).toEqual('_blank')
        expect(link?.getAttribute('rel')).toEqual('noopener noreferrer')
    })

    it('should render icon', () => {
        const { getByText } = render(
            <MemoryRouter>
                <table>
                    <tbody>
                        <tr>
                            <TicketIdBodyCell ticketId={'123'} />
                        </tr>
                    </tbody>
                </table>
            </MemoryRouter>,
        )

        const icon = getByText('open_in_new')

        expect(icon.tagName).toBe('I')
        expect(icon).toBeInTheDocument()
    })
})

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { SetupCards } from 'pages/integrations/integration/components/app/SetupCards/SetupCards'

describe('<SetupCards />', () => {
    it('renders both inbound and outbound slots with a Setup heading', () => {
        render(
            <SetupCards
                outbound={<div>outbound content</div>}
                inbound={<div>inbound content</div>}
            />,
        )

        expect(
            screen.getByRole('heading', { name: 'Setup' }),
        ).toBeInTheDocument()
        expect(screen.getByText('outbound content')).toBeInTheDocument()
        expect(screen.getByText('inbound content')).toBeInTheDocument()
    })

    it('renders only the outbound slot when inbound is omitted', () => {
        render(<SetupCards outbound={<div>outbound content</div>} />)

        expect(
            screen.getByRole('heading', { name: 'Setup' }),
        ).toBeInTheDocument()
        expect(screen.getByText('outbound content')).toBeInTheDocument()
    })

    it('renders only the inbound slot when outbound is omitted', () => {
        render(<SetupCards inbound={<div>inbound content</div>} />)

        expect(
            screen.getByRole('heading', { name: 'Setup' }),
        ).toBeInTheDocument()
        expect(screen.getByText('inbound content')).toBeInTheDocument()
    })

    it('renders nothing when both slots are omitted', () => {
        render(<SetupCards />)

        expect(
            screen.queryByRole('heading', { name: 'Setup' }),
        ).not.toBeInTheDocument()
    })
})

import { screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { renderWithRouter } from 'utils/testing'

import { Performance } from './Performance'

describe('<Performance />', () => {
    it('should render AI Journey landing page', () => {
        renderWithRouter(<Performance />)

        expect(screen.getByText('AI Journey Performance')).toBeInTheDocument()
    })

    it('filters journeys correctly', async () => {
        renderWithRouter(<Performance />)

        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(
            screen.getAllByText('Welcome New Subscribers').length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText('Post-Purchase Follow-up').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Customer Winback').length).toBeGreaterThan(
            0,
        )

        await userEvent.click(screen.getByText('Live'))
        expect(screen.getByText('Abandoned Cart')).toBeInTheDocument()
        expect(
            screen.queryByText('Welcome New Subscribers'),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText('Post-Purchase Follow-up'),
        ).not.toBeInTheDocument()
        expect(screen.queryByText('Customer Winback')).not.toBeInTheDocument()

        await userEvent.click(screen.getByText('Coming soon'))
        expect(screen.queryByText('Abandoned Cart')).not.toBeInTheDocument()
        expect(
            screen.getAllByText('Welcome New Subscribers').length,
        ).toBeGreaterThan(0)
        expect(
            screen.getAllByText('Post-Purchase Follow-up').length,
        ).toBeGreaterThan(0)
        expect(screen.getAllByText('Customer Winback').length).toBeGreaterThan(
            0,
        )
    })
})

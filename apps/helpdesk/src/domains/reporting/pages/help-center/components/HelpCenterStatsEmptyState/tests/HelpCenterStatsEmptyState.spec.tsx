import { screen } from '@testing-library/react'

import { HelpCenterStatsEmptyState } from 'domains/reporting/pages/help-center/components/HelpCenterStatsEmptyState/HelpCenterStatsEmptyState'
import { renderWithRouter } from 'utils/testing'

describe('<HelpCenterStatsEmptyState />', () => {
    it('should render', () => {
        renderWithRouter(<HelpCenterStatsEmptyState helpCenterId={undefined} />)

        expect(
            screen.getByText('You don’t have a published Help Center.'),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Manage Help Center').closest('a'),
        ).toHaveAttribute('href', '/app/settings/help-center')
    })

    it('should render with correct link', () => {
        renderWithRouter(<HelpCenterStatsEmptyState helpCenterId={1} />)

        expect(
            screen.getByText('Manage Help Center').closest('a'),
        ).toHaveAttribute('href', '/app/settings/help-center/1/publish-track')
    })
})

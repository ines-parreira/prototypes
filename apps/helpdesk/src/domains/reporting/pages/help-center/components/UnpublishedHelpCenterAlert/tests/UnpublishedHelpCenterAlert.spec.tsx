import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import UnpublishedHelpCenterAlert from 'domains/reporting/pages/help-center/components/UnpublishedHelpCenterAlert/UnpublishedHelpCenterAlert'

describe('<UnpublishedHelpCenterAlert />', () => {
    it('should render with correct text and link', () => {
        render(
            <MemoryRouter>
                <UnpublishedHelpCenterAlert helpCenterId={1} />
            </MemoryRouter>,
        )

        expect(
            screen.getByText(
                'Set your Help Center back to live in order to view performance insights.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Manage Help Center').closest('a'),
        ).toHaveAttribute('href', '/app/settings/help-center/1/publish-track')
    })
})

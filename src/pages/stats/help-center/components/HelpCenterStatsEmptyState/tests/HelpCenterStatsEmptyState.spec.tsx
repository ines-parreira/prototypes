import React from 'react'
import {render, screen} from '@testing-library/react'
import {HelpCenterStatsEmptyState} from '../HelpCenterStatsEmptyState'

describe('<HelpCenterStatsEmptyState />', () => {
    it('should render', () => {
        render(<HelpCenterStatsEmptyState helpCenterId={undefined} />)

        expect(
            screen.getByText('You don’t have a published Help Center.')
        ).toBeInTheDocument()
        expect(
            screen.getByText('Manage Help Center').closest('a')
        ).toHaveAttribute('to', '/app/settings/help-center')
    })

    it('should render with correct link', () => {
        render(<HelpCenterStatsEmptyState helpCenterId={1} />)

        expect(
            screen.getByText('Manage Help Center').closest('a')
        ).toHaveAttribute('to', '/app/settings/help-center/1/publish-track')
    })
})

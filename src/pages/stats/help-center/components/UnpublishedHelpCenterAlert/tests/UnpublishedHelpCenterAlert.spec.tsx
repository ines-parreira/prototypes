import React from 'react'

import { render, screen } from '@testing-library/react'

import UnpublishedHelpCenterAlert from '../UnpublishedHelpCenterAlert'

describe('<UnpublishedHelpCenterAlert />', () => {
    it('should render with correct text and link', () => {
        render(<UnpublishedHelpCenterAlert helpCenterId={1} />)

        expect(
            screen.getByText(
                'Set your Help Center back to live in order to view performance insights.',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText('Manage Help Center').closest('a'),
        ).toHaveAttribute('to', '/app/settings/help-center/1/publish-track')
    })
})

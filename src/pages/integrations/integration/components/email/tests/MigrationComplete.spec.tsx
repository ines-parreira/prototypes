import {fireEvent, render, screen} from '@testing-library/react'
import React from 'react'

import MigrationComplete from '../EmailMigration/MigrationComplete'

const mockHistoryPush = jest.fn()
jest.mock('react-router-dom', () => ({
    useHistory: () => ({
        block: jest.fn(),
        push: mockHistoryPush,
    }),
}))

describe('MigrationComplete', () => {
    const renderComponent = () => render(<MigrationComplete />)

    it('should display icon and "Migration complete"', () => {
        renderComponent()

        expect(
            screen.getByRole('img', {
                name: /all done/i,
            })
        ).toBeVisible()
        expect(
            screen.getByRole('heading', {
                name: /migration complete/i,
            })
        ).toBeVisible()
    })

    it('should navigate to email integration list when clicking Go Home', () => {
        renderComponent()

        fireEvent.click(
            screen.getByRole('button', {
                name: /go home/i,
            })
        )
        expect(mockHistoryPush).toHaveBeenCalledWith(
            '/app/settings/channels/email'
        )
    })
})

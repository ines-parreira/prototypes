import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import {renderWithRouter} from 'utils/testing'

import OutOfRecoveryCodesModal from '../OutOfRecoveryCodesModal'

describe('<OutOfRecoveryCodesModal />', () => {
    it('should not show anything if the parameter is not in the URL', () => {
        renderWithRouter(<OutOfRecoveryCodesModal />)

        expect(
            screen.queryByText('Reset Authentication Now')
        ).not.toBeInTheDocument()
    })

    it('should render when the parameter is passed in the URL', () => {
        const route = '/app?out_of_recovery_codes=true'
        renderWithRouter(<OutOfRecoveryCodesModal />, {route})

        expect(screen.getByText('Reset Authentication Now')).toBeInTheDocument()
        expect(
            screen.getByRole('button', {name: 'Reset Authentication'})
        ).toBeInTheDocument()
    })

    it('should go to the 2FA settings page when cliking the "Reset Authentication" button', () => {
        const route = '/app?out_of_recovery_codes=true'
        const history = createMemoryHistory({initialEntries: [route]})
        renderWithRouter(<OutOfRecoveryCodesModal />, {history})

        fireEvent.click(
            screen.getByRole('button', {name: 'Reset Authentication'})
        )

        expect(history.location.pathname).toBe('/app/settings/password-2fa')
    })
})

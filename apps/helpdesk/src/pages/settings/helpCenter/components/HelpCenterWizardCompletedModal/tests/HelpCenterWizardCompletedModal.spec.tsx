import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'

import { useSearchParam } from 'hooks/useSearchParam'
import { userEvent } from 'utils/testing/userEvent'

import { HELP_CENTER_WIZARD_COMPLETED_STATE } from '../../../constants'
import HelpCenterWizardCompletedModal from '../HelpCenterWizardCompletedModal'

jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(() => []),
}))

const mockedUseSearchParam = jest.mocked(useSearchParam)

const renderComponent = () => {
    render(<HelpCenterWizardCompletedModal />)
}

describe('<HelpCenterWizardCompletedModal />', () => {
    beforeEach(() => {
        mockedUseSearchParam.mockReturnValue([null, jest.fn()])
    })

    it('should hide modal when no query param', () => {
        renderComponent()

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    it('should hide modal when query param is wrong', () => {
        mockedUseSearchParam.mockReturnValue(['wrong', jest.fn()])
        renderComponent()

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    describe('when query param is correct', () => {
        it('should show all set modal', () => {
            mockedUseSearchParam.mockReturnValue([
                HELP_CENTER_WIZARD_COMPLETED_STATE.AllSet,
                jest.fn(),
            ])
            renderComponent()

            expect(screen.queryByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('You’re all set!')).toBeInTheDocument()
        })

        it('should show almost done modal', () => {
            mockedUseSearchParam.mockReturnValue([
                HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone,
                jest.fn(),
            ])
            renderComponent()

            expect(screen.queryByRole('dialog')).toBeInTheDocument()
            expect(screen.getByText('Almost there!')).toBeInTheDocument()
        })

        it('should close modal and remove param from the query', async () => {
            const mockSetSearchParam = jest.fn()

            mockedUseSearchParam.mockReturnValue([
                HELP_CENTER_WIZARD_COMPLETED_STATE.AlmostDone,
                mockSetSearchParam,
            ])
            renderComponent()

            userEvent.click(screen.getByRole('button', { name: 'Continue' }))

            await waitFor(() =>
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
            )
            expect(mockSetSearchParam).toHaveBeenCalledWith(null)
        })
    })
})

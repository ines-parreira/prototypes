import { assumeMock } from '@repo/testing'
import { act, fireEvent, screen } from '@testing-library/react'

import { useSearchParam } from 'hooks/useSearchParam'
import { renderWithRouter } from 'utils/testing'

import VerifyDomainModal from '../VerifyDomainModal'

jest.mock('hooks/useSearchParam')

const useSearchParamMock = assumeMock(useSearchParam)

describe('VerifyDomainModal', () => {
    const renderComponent = () => renderWithRouter(<VerifyDomainModal />)

    it('should be closed when is_redirect is not "true"', () => {
        useSearchParamMock.mockReturnValue([null] as any)

        renderComponent()

        expect(
            screen.queryByText('Verify your email domain'),
        ).not.toBeInTheDocument()
    })

    it('should be opened when is_redirect is "true"', () => {
        useSearchParamMock.mockReturnValue(['true'] as any)

        renderComponent()

        expect(screen.getByText('Verify your email domain')).toBeInTheDocument()
    })

    it('should remove search param when Verify domain button is clicked', () => {
        const setParamMock = jest.fn()
        useSearchParamMock.mockReturnValue(['true', setParamMock] as any)

        renderComponent()

        act(() => {
            fireEvent.click(screen.getByText('Verify domain'))
        })

        expect(setParamMock).toHaveBeenCalledWith(null)
    })

    it('should redirect to email integrations list when Finish later button is clicked', () => {
        useSearchParamMock.mockReturnValue(['true'] as any)

        renderComponent()

        const finishLaterButton = screen.getByText('Finish later')
        expect(finishLaterButton.closest('a')).toHaveAttribute(
            'to',
            '/app/settings/channels/email',
        )
    })
})

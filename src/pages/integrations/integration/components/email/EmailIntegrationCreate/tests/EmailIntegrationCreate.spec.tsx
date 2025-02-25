import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import useAppSelector from 'hooks/useAppSelector'

import EmailIntegrationCreate from '../EmailIntegrationCreate'

jest.mock('hooks/useAppSelector', () => jest.fn())

const useAppSelectorMock = useAppSelector as jest.Mock

const renderComponent = () => render(<EmailIntegrationCreate />)

describe('<EmailIntegrationCreate/>', () => {
    beforeEach(() => {
        useAppSelectorMock
            .mockReturnValueOnce('testGmail')
            .mockReturnValueOnce('testOutlook')
    })

    it('should link to the new onboarding flow', () => {
        renderComponent()

        const link = screen
            .getByRole('button', {
                name: 'Get started',
            })
            .closest('a')

        expect(link).toHaveAttribute(
            'to',
            '/app/settings/channels/email/new/onboarding',
        )
    })

    it('should open Gmail redirect URI on Gmail card click', () => {
        renderComponent()
        const gmailCard = screen.getByText('Connect Gmail account')

        window.open = jest.fn()
        fireEvent.click(gmailCard)

        expect(window.open).toHaveBeenCalledWith('testGmail')
    })

    it('should open Outlook redirect URI on Microsoft card click', () => {
        renderComponent()
        const outlookCard = screen.getByText('Connect Microsoft account')

        window.open = jest.fn()
        fireEvent.click(outlookCard)

        expect(window.open).toHaveBeenCalledWith('testOutlook')
    })
})

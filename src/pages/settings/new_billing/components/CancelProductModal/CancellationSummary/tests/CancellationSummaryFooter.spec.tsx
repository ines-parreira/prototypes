import React from 'react'

import { fireEvent, render, waitFor } from '@testing-library/react'

import CancellationSummaryFooter from '../CancellationSummaryFooter'

describe('CancellationSummaryFooter', () => {
    const onConfirmMock = jest.fn()
    const isLoading = false

    afterEach(() => {
        onConfirmMock.mockClear()
    })

    it('renders correctly', () => {
        const { getByRole } = render(
            <CancellationSummaryFooter
                onConfirm={onConfirmMock}
                isLoading={isLoading}
            />,
        )

        const confirmButton = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        expect(confirmButton).toBeInTheDocument()
        expect(confirmButton).toBeAriaDisabled()
    })

    it('calls onConfirm when "Confirm" button is clicked and agreement is checked', async () => {
        const { getByRole } = render(
            <CancellationSummaryFooter
                onConfirm={onConfirmMock}
                isLoading={isLoading}
            />,
        )

        const confirmButton = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        const agreementCheckbox = getByRole('checkbox')

        fireEvent.click(agreementCheckbox)
        await waitFor(() => {
            expect(confirmButton).toBeAriaEnabled()
        })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(onConfirmMock).toHaveBeenCalledTimes(1)
        })
    })

    it('does not call onConfirm when "Confirm" button is clicked and agreement is not checked', async () => {
        const { getByRole } = render(
            <CancellationSummaryFooter
                onConfirm={onConfirmMock}
                isLoading={isLoading}
            />,
        )

        const confirmButton = getByRole('button', {
            name: 'Confirm Auto-Renewal Cancellation',
        })
        fireEvent.click(confirmButton)

        await waitFor(() => {
            expect(onConfirmMock).not.toHaveBeenCalled()
        })
    })

    it('disables "Confirm" button when isLoading is true', () => {
        const { getByRole } = render(
            <CancellationSummaryFooter
                onConfirm={onConfirmMock}
                isLoading={true}
            />,
        )

        const confirmButton = getByRole('button', {
            name: /Confirm Auto-Renewal Cancellation/,
        })
        expect(confirmButton).toBeAriaDisabled()
    })
})

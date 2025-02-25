import React from 'react'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'

import { EmailIntegration } from 'models/integration/types'
import { assumeMock } from 'utils/testing'

import EmailIntegrationForwardingSetupForm from '../EmailIntegrationForwardingSetupForm'
import {
    EmailIntegrationOnboardingStep,
    useEmailOnboarding,
    UseEmailOnboardingHookResult,
} from '../hooks/useEmailOnboarding'

const renderComponent = () => render(<EmailIntegrationForwardingSetupForm />)

jest.mock('../hooks/useEmailOnboarding')
jest.mock(
    '../BaseEmailIntegrationInputField',
    () => () => '<BaseEmailIntegrationInputField />',
)

const existingIntegration = {
    id: 1,
    name: 'Acme',
    meta: {
        address: 'acme@gorgias.test',
    },
} as EmailIntegration

const defaultHookResult = {
    currentStep: EmailIntegrationOnboardingStep.ForwardingSetup,
    integration: existingIntegration,
    sendVerification: jest.fn(),
    goToNext: jest.fn(),
} as unknown as UseEmailOnboardingHookResult

const useEmailOnboardingMock = assumeMock(useEmailOnboarding)
useEmailOnboardingMock.mockReturnValue(defaultHookResult)

describe('<EmailIntegrationForwardingSetupForm />', () => {
    it('should render with the appropriate fields', () => {
        renderComponent()

        expect(
            screen.getByText('Forward your support emails to Gorgias'),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'In this step, you will go to your email provider to set up forwarding rules that will forward a copy of incoming customer emails to Gorgias, where they will appear as tickets.',
            ),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('checkbox', {
                name: /Yes, I’ve set up email forwarding/,
            }),
        ).toBeInTheDocument()

        expect(
            screen.getByText('<BaseEmailIntegrationInputField />'),
        ).toBeInTheDocument()

        expect(
            screen.getByRole('button', { name: 'Begin Verification' }),
        ).toBeInTheDocument()
    })

    it('should validate the checkbox field as required', async () => {
        renderComponent()

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(
                screen.getByText('This field is required'),
            ).toBeInTheDocument()
        })
    })

    it('should call sendVerification onSubmit', async () => {
        renderComponent()

        fireEvent.click(
            screen.getByRole('checkbox', {
                name: /Yes, I’ve set up email forwarding/,
            }),
        )

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.sendVerification).toHaveBeenCalled()
        })
    })

    it('should render as checked if the request has been made', () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
        })

        renderComponent()

        const checkbox = screen.getByRole('checkbox', {
            name: /Yes, I’ve set up email forwarding/,
        })

        expect(checkbox).toBeChecked()
        expect(checkbox).toBeDisabled()
    })

    it('should advance to next step is already requested', async () => {
        useEmailOnboardingMock.mockReturnValue({
            ...defaultHookResult,
            isRequested: true,
        })

        renderComponent()

        fireEvent.submit(screen.getByRole('form'))

        await waitFor(() => {
            expect(defaultHookResult.goToNext).toHaveBeenCalled()
            expect(defaultHookResult.sendVerification).not.toHaveBeenCalled()
        })
    })
})

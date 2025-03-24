import React from 'react'

import { render, screen } from '@testing-library/react'

import VoiceIntegrationOnboarding from '../VoiceIntegrationOnboarding'

jest.mock('../AddPhoneNumberStep', () =>
    jest.fn(() => <div>AddPhoneNumberStep</div>),
)
jest.mock('../ConfigureCallFlowStep', () =>
    jest.fn(() => <div>ConfigureCallFlowStep</div>),
)

describe('VoiceIntegrationOnboarding', () => {
    const renderComponent = () => render(<VoiceIntegrationOnboarding />)

    it('should display both steps in the progress header', () => {
        renderComponent()

        expect(screen.getByText('Add phone number')).toBeInTheDocument()
        expect(screen.getByText('Configure call flow')).toBeInTheDocument()
    })

    it('should display first step by default', () => {
        renderComponent()

        expect(screen.getByText('AddPhoneNumberStep')).toBeInTheDocument()
        expect(
            screen.queryByText('ConfigureCallFlowStep'),
        ).not.toBeInTheDocument()
    })
})

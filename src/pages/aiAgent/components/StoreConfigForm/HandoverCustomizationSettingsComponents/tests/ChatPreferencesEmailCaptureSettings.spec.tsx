import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import {
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
} from 'config/integrations/gorgias_chat'

import ChatPreferencesEmailCaptureSettings from '../ChatPreferencesEmailCaptureSettings'

describe('ChatPreferencesEmailCaptureSettings', () => {
    const defaultProps = {
        isEnabled: true,
        emailCaptureEnforcement: GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL,
        onToggleEnablement: jest.fn(),
        onEmailCaptureEnforcementChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(<ChatPreferencesEmailCaptureSettings {...defaultProps} />)

        screen.getByText('Email capture')
        screen.getByText('Enable email capture')
        screen.getByText('Optional')
        screen.getByText('Required')
    })

    it('calls onToggleEnablement when enabled and toggle is clicked', () => {
        render(<ChatPreferencesEmailCaptureSettings {...defaultProps} />)

        const toggle = screen.getByRole('switch', {
            name: 'Enable email capture',
        })
        fireEvent.click(toggle)

        expect(defaultProps.onToggleEnablement).toHaveBeenCalledWith(false)
    })

    it('calls onToggleEnablement when disabled and toggle is clicked', () => {
        render(
            <ChatPreferencesEmailCaptureSettings
                {...defaultProps}
                isEnabled={false}
            />,
        )

        const toggle = screen.getByRole('switch', {
            name: 'Enable email capture',
        })
        fireEvent.click(toggle)

        expect(defaultProps.onToggleEnablement).toHaveBeenCalledWith(true)
    })

    it('calls onEmailCaptureEnforcementChange when radio option required is selected', () => {
        render(<ChatPreferencesEmailCaptureSettings {...defaultProps} />)

        const option = screen.getByRole('radio', {
            name: /Required/i,
        })

        fireEvent.click(option)

        expect(
            defaultProps.onEmailCaptureEnforcementChange,
        ).toHaveBeenCalledWith(
            GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED,
        )
    })

    it('calls onEmailCaptureEnforcementChange when radio option "optional" is selected', () => {
        render(
            <ChatPreferencesEmailCaptureSettings
                {...defaultProps}
                emailCaptureEnforcement={
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                }
            />,
        )

        const option = screen.getByRole('radio', {
            name: /Optional/i,
        })
        fireEvent.click(option)

        expect(
            defaultProps.onEmailCaptureEnforcementChange,
        ).toHaveBeenCalledWith(GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_OPTIONAL)
    })

    it('disables radio options when isEnabled is false', () => {
        render(
            <ChatPreferencesEmailCaptureSettings
                {...defaultProps}
                isEnabled={false}
            />,
        )

        const radioFieldset = screen.getAllByRole('radio')
        radioFieldset.forEach((radio) =>
            expect(radio).toHaveAttribute('disabled'),
        )
    })

    it('correctly preselects the radio option based on emailCaptureEnforcement', () => {
        render(
            <ChatPreferencesEmailCaptureSettings
                {...defaultProps}
                emailCaptureEnforcement={
                    GORGIAS_CHAT_WIDGET_EMAIL_CAPTURE_ALWAYS_REQUIRED
                }
            />,
        )

        const requiredRadio = screen.getByRole('radio', {
            name: /Required/i,
        })
        expect(requiredRadio).toBeChecked()
    })
})

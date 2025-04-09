import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'

import { GorgiasChatAutoResponderReply } from 'models/integration/types'

import ChatPreferencesAutoReplyWaitTimeSettings from '../ChatPreferencesAutoReplyWaitTimeSettings'

describe('ChatPreferencesAutoReplyWaitTimeSettings', () => {
    const defaultProps = {
        isEnabled: true,
        autoResponderReply: GorgiasChatAutoResponderReply.ReplyDynamic,
        onToggleEnablement: jest.fn(),
        onAutoResponderReplyChange: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders with default props', () => {
        render(<ChatPreferencesAutoReplyWaitTimeSettings {...defaultProps} />)

        screen.getByText('Wait time')
        screen.getByText('Send wait time')
        screen.getByText('Dynamic wait time (recommended)')
        screen.getByText('In a few minutes')
        screen.getByText('In a few hours')
    })

    it('calls onToggleEnablement when enabled and toggle is clicked', () => {
        render(<ChatPreferencesAutoReplyWaitTimeSettings {...defaultProps} />)

        const toggle = screen.getByRole('switch', {
            name: 'Provide auto-reply wait time in the chat',
        })
        fireEvent.click(toggle)

        expect(defaultProps.onToggleEnablement).toHaveBeenCalledWith(false)
    })

    it('calls onToggleEnablement when disabled and toggle is clicked', () => {
        render(
            <ChatPreferencesAutoReplyWaitTimeSettings
                {...defaultProps}
                isEnabled={false}
            />,
        )

        const toggle = screen.getByRole('switch', {
            name: 'Provide auto-reply wait time in the chat',
        })
        fireEvent.click(toggle)

        expect(defaultProps.onToggleEnablement).toHaveBeenCalledWith(true)
    })

    it('calls onAutoResponderReplyChange when "In a few minutes" option is selected', () => {
        render(<ChatPreferencesAutoReplyWaitTimeSettings {...defaultProps} />)

        const option = screen.getByRole('radio', {
            name: /In a few minutes/i,
        })
        fireEvent.click(option)

        expect(defaultProps.onAutoResponderReplyChange).toHaveBeenCalledWith(
            GorgiasChatAutoResponderReply.ReplyInMinutes,
        )
    })

    it('calls onAutoResponderReplyChange when "In a few hours" option is selected', () => {
        render(<ChatPreferencesAutoReplyWaitTimeSettings {...defaultProps} />)

        const option = screen.getByRole('radio', {
            name: /In a few hours/i,
        })
        fireEvent.click(option)

        expect(defaultProps.onAutoResponderReplyChange).toHaveBeenCalledWith(
            GorgiasChatAutoResponderReply.ReplyInHours,
        )
    })

    it('calls onAutoResponderReplyChange when "Dynamic wait time" option is selected', () => {
        render(
            <ChatPreferencesAutoReplyWaitTimeSettings
                {...defaultProps}
                autoResponderReply={
                    GorgiasChatAutoResponderReply.ReplyInMinutes
                }
            />,
        )

        const option = screen.getByRole('radio', {
            name: /Dynamic wait time \(recommended\)/i,
        })
        fireEvent.click(option)

        expect(defaultProps.onAutoResponderReplyChange).toHaveBeenCalledWith(
            GorgiasChatAutoResponderReply.ReplyDynamic,
        )
    })

    it('disables radio options when isEnabled is false', () => {
        render(
            <ChatPreferencesAutoReplyWaitTimeSettings
                {...defaultProps}
                isEnabled={false}
            />,
        )

        const radioFieldset = screen.getAllByRole('radio')
        radioFieldset.forEach((radio) =>
            expect(radio).toHaveAttribute('disabled'),
        )
    })

    it('correctly preselects the radio option based on autoResponderReply', () => {
        render(
            <ChatPreferencesAutoReplyWaitTimeSettings
                {...defaultProps}
                autoResponderReply={GorgiasChatAutoResponderReply.ReplyInHours}
            />,
        )

        const hoursRadio = screen.getByRole('radio', {
            name: /In a few hours/i,
        })
        expect(hoursRadio).toBeChecked()
    })
})

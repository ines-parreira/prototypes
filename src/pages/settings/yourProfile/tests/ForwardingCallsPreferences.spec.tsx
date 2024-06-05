import React from 'react'
import {mockFlags} from 'jest-launchdarkly-mock'
import {fireEvent, render} from '@testing-library/react'
import {FeatureFlagKey} from 'config/featureFlags'
import ForwardingCallsPreferences from '../components/ForwardingCallsPreferences'

const mockSetPreference = jest.fn()

jest.mock('pages/common/forms/PhoneNumberInput/PhoneNumberInput', () => {
    return function PhoneNumberInput({
        disabled,
        onChange,
        value,
    }: {
        disabled: boolean
        onChange: (value: string) => void
        value: string
    }) {
        return (
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                data-testid="mock-phone-input"
                disabled={disabled}
            />
        )
    }
})

describe('ForwardingCallsPreferences', () => {
    it('should not render phone number with FF off', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: false})

        const {getByText, queryByTestId, queryByText} = render(
            <ForwardingCallsPreferences
                forwardCalls={false}
                forwardingPhoneNumber={'+112345'}
                setPreference={mockSetPreference}
            />
        )

        expect(queryByText('Enable call forwarding')).toBeInTheDocument()
        expect(queryByTestId('mock-phone-input')).toBeNull()

        fireEvent.click(getByText('Enable call forwarding'))
        expect(mockSetPreference).toHaveBeenCalledWith('forward_calls', true)
    })

    it('should render phone number with FF off', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: false})

        const {getByText, getByTestId} = render(
            <ForwardingCallsPreferences
                forwardCalls={true}
                forwardingPhoneNumber={'+112345'}
                setPreference={mockSetPreference}
            />
        )

        expect(getByText('Enable call forwarding')).toBeInTheDocument()
        expect(getByTestId('mock-phone-input')).toBeInTheDocument()

        fireEvent.click(getByText('Enable call forwarding'))
        expect(mockSetPreference).toHaveBeenCalledWith('forward_calls', false)
    })

    it('should render preferences disabled', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: true})

        const {getByText, getByTestId} = render(
            <ForwardingCallsPreferences
                forwardCalls={false}
                forwardingPhoneNumber={'+112345'}
                forwardWhenOffline={true}
                setPreference={mockSetPreference}
            />
        )

        expect(getByText('Enable call forwarding')).toBeInTheDocument()

        expect(getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(getByTestId('mock-phone-input')).toBeDisabled()

        expect(getByText('Forward calls when offline')).toBeInTheDocument()
        expect(
            getByText('Forward calls when offline').firstElementChild
        ).toBeChecked()
        expect(
            getByText('Forward calls when offline').firstElementChild
        ).toBeDisabled()

        fireEvent.click(getByText('Enable call forwarding'))
        expect(mockSetPreference).toHaveBeenCalledWith('forward_calls', true)
    })

    it('should render preferences', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: true})

        const {getByText, getByTestId} = render(
            <ForwardingCallsPreferences
                forwardCalls={true}
                forwardingPhoneNumber={'+112345'}
                setPreference={mockSetPreference}
            />
        )

        expect(getByText('Enable call forwarding')).toBeInTheDocument()

        expect(getByTestId('mock-phone-input')).toBeInTheDocument()
        expect(getByTestId('mock-phone-input')).not.toBeDisabled()

        expect(getByText('Forward calls when offline')).toBeInTheDocument()
        expect(
            getByText('Forward calls when offline').firstElementChild
        ).not.toBeChecked()
        expect(
            getByText('Forward calls when offline').firstElementChild
        ).not.toBeDisabled()
    })

    it('should update phone number', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: true})

        const {getByTestId} = render(
            <ForwardingCallsPreferences
                forwardCalls={true}
                forwardingPhoneNumber={'+112345'}
                setPreference={mockSetPreference}
            />
        )

        fireEvent.change(getByTestId('mock-phone-input'), {
            target: {value: '12'},
        })
        expect(mockSetPreference).toHaveBeenCalledWith(
            'forwarding_phone_number',
            '12'
        )
    })

    it('should update forward calls when offline', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: true})

        const {getByText} = render(
            <ForwardingCallsPreferences
                forwardCalls={true}
                forwardingPhoneNumber={'+112345'}
                setPreference={mockSetPreference}
            />
        )

        fireEvent.click(getByText('Forward calls when offline'))
        expect(mockSetPreference).toHaveBeenCalledWith(
            'forward_when_offline',
            true
        )
    })

    it('should use defaults', () => {
        mockFlags({[FeatureFlagKey.NewForwardCallsSection]: true})

        const {getByText, getByTestId} = render(
            <ForwardingCallsPreferences setPreference={mockSetPreference} />
        )

        expect(getByText('Enable call forwarding')).toBeInTheDocument()
        expect(getByTestId('mock-phone-input')).toBeInTheDocument()
    })
})

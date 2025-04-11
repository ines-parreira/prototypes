import { fireEvent, render, screen } from '@testing-library/react'

import useVoiceDevice from 'hooks/integrations/phone/useVoiceDevice'
import { VoiceCall } from 'models/voiceCall/types'
import { assumeMock } from 'utils/testing'

import useWrapUpTime from '../useWrapUpTime'
import WrapUpCallBar from '../WrapUpCallBar'

jest.mock('../useWrapUpTime')
jest.mock(
    '../PhoneIntegrationName/PhoneIntegrationName',
    () => (props: { integrationId: number }) => (
        <div data-testid="phone-integration-name">
            Phone Integration Name (ID: {props.integrationId})
        </div>
    ),
)
jest.mock('hooks/integrations/phone/useVoiceDevice')

const useWrapUpTimeMock = assumeMock(useWrapUpTime)
const useVoiceDeviceMock = assumeMock(useVoiceDevice)

describe('WrapUpCallBar', () => {
    const renderComponent = () => {
        return render(<WrapUpCallBar />)
    }

    const mockVoiceCall: Partial<VoiceCall> = {
        integration_id: 456,
        external_id: 'test-call-sid',
    }

    beforeEach(() => {
        useWrapUpTimeMock.mockReturnValue({
            isWrappingUp: false,
            timeLeft: null,
            voiceCall: null,
            endWrapUpTimeMutation: {
                mutate: jest.fn(),
                isLoading: false,
            } as any,
        })
        useVoiceDeviceMock.mockReturnValue({
            call: null,
        } as any)
    })

    it('renders nothing when not wrapping up', () => {
        const { container } = renderComponent()
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when wrapping up but no voice call', () => {
        useWrapUpTimeMock.mockReturnValue({
            isWrappingUp: true,
            timeLeft: '01:30',
            voiceCall: null,
            endWrapUpTimeMutation: {
                mutate: jest.fn(),
                isLoading: false,
            } as any,
        })

        const { container } = renderComponent()
        expect(container).toBeEmptyDOMElement()
    })

    it('renders nothing when there is a call', () => {
        useVoiceDeviceMock.mockReturnValue({
            call: mockVoiceCall as VoiceCall,
        } as any)

        const { container } = renderComponent()
        expect(container).toBeEmptyDOMElement()
    })

    it('renders the wrap-up bar when wrapping up with voice call', () => {
        useWrapUpTimeMock.mockReturnValue({
            isWrappingUp: true,
            timeLeft: '01:30',
            voiceCall: mockVoiceCall as VoiceCall,
            endWrapUpTimeMutation: {
                mutate: jest.fn(),
                isLoading: false,
            } as any,
        })

        renderComponent()

        expect(screen.getByText('Post call wrap-up')).toBeInTheDocument()
        expect(screen.getByText('01:30')).toBeInTheDocument()
        expect(screen.getByText('End wrap-up time')).toBeInTheDocument()
        expect(screen.getByTestId('phone-integration-name')).toBeInTheDocument()
    })

    it('calls endWrapUpTimeMutation when clicking the end wrap-up button', async () => {
        const mutateMock = jest.fn()

        useWrapUpTimeMock.mockReturnValue({
            isWrappingUp: true,
            timeLeft: '01:30',
            voiceCall: mockVoiceCall as VoiceCall,
            endWrapUpTimeMutation: {
                mutate: mutateMock,
                isLoading: false,
            } as any,
        })

        renderComponent()

        fireEvent.click(screen.getByText('End wrap-up time'))

        expect(mutateMock).toHaveBeenCalledWith({
            data: {
                call_sid: 'test-call-sid',
            },
        })
    })

    it('shows loading state when endWrapUpTimeMutation is loading', () => {
        useWrapUpTimeMock.mockReturnValue({
            isWrappingUp: true,
            timeLeft: '01:30',
            voiceCall: mockVoiceCall as VoiceCall,
            endWrapUpTimeMutation: {
                mutate: jest.fn(),
                isLoading: true,
            } as any,
        })

        renderComponent()

        const button = screen.getByText('End wrap-up time')
        expect(button).toBeAriaDisabled()
    })
})

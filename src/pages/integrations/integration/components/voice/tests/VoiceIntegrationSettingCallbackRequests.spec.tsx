import { fireEvent, render, screen } from '@testing-library/react'

import { Form } from 'core/forms'

import VoiceIntegrationSettingCallbackRequests from '../VoiceIntegrationSettingCallbackRequests'

jest.mock('../VoiceMessageFieldWithLabel', () =>
    jest.fn(({ name }) => <div>VoiceMessageFieldWithLabel {name}</div>),
)

describe('VoiceIntegrationSettingCallbackRequests', () => {
    const renderComponent = () => {
        return render(
            <Form onValidSubmit={jest.fn()}>
                <VoiceIntegrationSettingCallbackRequests />
            </Form>,
        )
    }

    it('should render the toggle field for callback requests', () => {
        renderComponent()

        expect(
            screen.getByText('Allow callers to request callback'),
        ).toBeInTheDocument()
    })

    it('should not render additional fields when callback requests are disabled', () => {
        renderComponent()

        expect(
            screen.queryByText(
                'VoiceMessageFieldWithLabel meta.callback_requests.prompt_message',
            ),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'VoiceMessageFieldWithLabel meta.callback_requests.confirmation_message',
            ),
        ).not.toBeInTheDocument()
        expect(
            screen.queryByText(
                'Allow caller to leave a voice message after requesting a callback',
            ),
        ).not.toBeInTheDocument()
    })

    it('should render additional fields when callback requests are enabled', () => {
        renderComponent()

        fireEvent.click(screen.getByText('Allow callers to request callback'))

        expect(
            screen.getByText(
                'VoiceMessageFieldWithLabel meta.callback_requests.prompt_message',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'VoiceMessageFieldWithLabel meta.callback_requests.confirmation_message',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'Allow caller to leave a voice message after requesting a callback',
            ),
        ).toBeInTheDocument()
    })
})

import { fireEvent, render, screen } from '@testing-library/react'

import { Form } from 'core/forms'

import VoiceIntegrationSettingCallbackRequests from '../VoiceIntegrationSettingCallbackRequests'

jest.mock('../VoiceMessageFieldWithLabel', () =>
    jest.fn(({ name }) => <div>VoiceMessageFieldWithLabel {name}</div>),
)

describe('VoiceIntegrationSettingCallbackRequests', () => {
    const renderComponent = (defaultValues: any = undefined) => {
        return render(
            <Form onValidSubmit={jest.fn()} defaultValues={defaultValues}>
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

    it('should show/hide info banner based on voice message checkbox dirty state', () => {
        renderComponent({
            meta: {
                callback_requests: {
                    enabled: false,
                    allow_to_leave_voicemail: false,
                },
            },
        })

        fireEvent.click(screen.getByText('Allow callers to request callback'))

        expect(
            screen.queryByText(
                'Update the confirmation message to indicate if callers can leave a voice message after requesting a callback or not.',
            ),
        ).not.toBeInTheDocument()

        fireEvent.click(
            screen.getByText(
                'Allow caller to leave a voice message after requesting a callback',
            ),
        )

        expect(
            screen.getByText(
                'Update the confirmation message to indicate if callers can leave a voice message after requesting a callback or not.',
            ),
        ).toBeInTheDocument()

        // reverting back to the initial state
        fireEvent.click(
            screen.getByText(
                'Allow caller to leave a voice message after requesting a callback',
            ),
        )

        expect(
            screen.queryByText(
                'Update the confirmation message to indicate if callers can leave a voice message after requesting a callback or not.',
            ),
        ).not.toBeInTheDocument()
    })
})

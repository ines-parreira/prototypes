import { Form } from '@repo/forms'
import { screen } from '@testing-library/react'

import { renderWithStoreAndQueryClientProvider } from 'tests/renderWithStoreAndQueryClientProvider'

import VoiceIntegrationSettingSpamPrevention from '../VoiceIntegrationSettingSpamPrevention'

describe('VoiceIntegrationSettingSpamPrevention', () => {
    const renderComponent = (spamPrevention = false) =>
        renderWithStoreAndQueryClientProvider(
            <Form
                defaultValues={{
                    meta: {
                        preferences: {
                            spam_prevention: spamPrevention,
                        },
                    },
                }}
                onValidSubmit={jest.fn()}
            >
                <VoiceIntegrationSettingSpamPrevention />
            </Form>,
        )

    it('renders with toggle off', () => {
        renderComponent(false)

        expect(
            screen.getByText(
                'Notify agents by indicating "Maybe spam" for incoming calls',
            ),
        ).toBeInTheDocument()

        expect(screen.getByRole('switch')).not.toBeChecked()
    })

    it('renders with toggle on', () => {
        renderComponent(true)

        expect(
            screen.getByText(
                'Notify agents by indicating "Maybe spam" for incoming calls',
            ),
        ).toBeInTheDocument()

        expect(screen.getByRole('switch')).toBeChecked()
    })
})

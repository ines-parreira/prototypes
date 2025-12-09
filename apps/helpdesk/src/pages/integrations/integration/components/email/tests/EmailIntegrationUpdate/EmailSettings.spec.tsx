import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { MemoryRouter } from 'react-router-dom'

import { IntegrationType } from 'models/integration/constants'
import EmailSettings from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailSettings'

jest.mock('state/integrations/actions', () => ({
    importEmails: jest.fn(),
}))

jest.mock('hooks/useAppDispatch', () => {
    return () => jest.fn()
})

jest.mock('hooks/useAppSelector', () => {
    return () => ({
        tickets: {
            suggestedResponses: [],
        },
        user: {
            current: {
                id: 1,
                name: 'Test User',
            },
        },
    })
})

jest.mock('pages/common/forms/RichFieldWithVariables', () => {
    return function MockRichFieldWithVariables({ onChange, label }: any) {
        return (
            <div>
                <label>{label}</label>
                <textarea
                    aria-label="signature-editor"
                    onChange={() => {
                        const mockSetSignatureText = jest.fn()
                        const mockSetSignatureHtml = jest.fn()
                        mockSetSignatureText('test')
                        mockSetSignatureHtml('<p>test</p>')
                        onChange({
                            getCurrentContent: () => ({
                                getPlainText: () => 'test',
                            }),
                        })
                    }}
                />
            </div>
        )
    }
})

const defaultProps = {
    integration: fromJS({
        id: 123,
        type: IntegrationType.Gmail,
        meta: {
            address: 'test@example.com',
            signature: {
                text: 'Test signature',
                html: '<p>Test signature</p>',
            },
        },
    }),
    loading: fromJS({}),
    domain: 'example.com',
    name: 'Support Team',
    useGmailCategories: false,
    enableGmailThreading: false,
    enableGmailSending: false,
    enableOutlookSending: false,
    setSignatureText: jest.fn(),
    setSignatureHtml: jest.fn(),
    setName: jest.fn(),
    setUseGmailCategories: jest.fn(),
    setEnableGmailThreading: jest.fn(),
    setEnableGmailSending: jest.fn(),
    setEnableOutlookSending: jest.fn(),
}

const renderEmailSettings = (props = {}) => {
    return render(
        <MemoryRouter>
            <EmailSettings {...defaultProps} {...props} />
        </MemoryRouter>,
    )
}

describe('EmailSettings', () => {
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
        jest.clearAllMocks()
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

        // Mock global state for BaseEmailIntegrationInputField
        ;(global as any).window = {
            ...global.window,
            GORGIAS_STATE: {
                integrations: {
                    authentication: {
                        email: {
                            forwarding_email_address: 'emails.gorgias.com',
                        },
                    },
                },
            },
        }
    })

    afterEach(() => {
        consoleSpy.mockRestore()
    })

    describe('common sections', () => {
        it('renders email settings title', () => {
            renderEmailSettings()

            expect(screen.getByText('Email Settings')).toBeInTheDocument()
        })

        it('renders display name and signature section', () => {
            renderEmailSettings()

            expect(
                screen.getByText('Display name and signature'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('textbox', { name: /display name/i }),
            ).toBeInTheDocument()
            expect(screen.getByText('Signature')).toBeInTheDocument()
        })
    })

    describe('display name field', () => {
        it('renders enabled display name field for Gmail', () => {
            renderEmailSettings({
                integration: fromJS({
                    id: 123,
                    type: IntegrationType.Gmail,
                    meta: { address: 'test@gmail.com' },
                }),
            })

            const displayNameField = screen.getByRole('textbox', {
                name: /display name/i,
            })
            expect(displayNameField).toBeInTheDocument()
            expect(displayNameField).not.toBeDisabled()
        })

        it('renders disabled display name field for Outlook with tooltip', () => {
            renderEmailSettings({
                integration: fromJS({
                    id: 123,
                    type: IntegrationType.Outlook,
                    meta: { address: 'test@outlook.com' },
                }),
            })

            const displayNameField = screen.getByRole('textbox', {
                name: /display name/i,
            })
            expect(displayNameField).toBeDisabled()
            expect(screen.getByText('info_outline')).toBeInTheDocument()
        })

        it('calls setName when display name is changed', async () => {
            const user = userEvent.setup()
            const mockSetName = jest.fn()

            renderEmailSettings({ setName: mockSetName })

            const displayNameField = screen.getByRole('textbox', {
                name: /display name/i,
            })
            await user.type(displayNameField, 'a')

            expect(mockSetName).toHaveBeenCalled()
        })
    })

    describe('signature editor', () => {
        it('renders signature editor with current signature', () => {
            renderEmailSettings()

            expect(screen.getByText('Signature')).toBeInTheDocument()
            expect(
                screen.getByLabelText('signature-editor'),
            ).toBeInTheDocument()
        })
    })

    describe('Gmail integration', () => {
        const gmailProps = {
            integration: fromJS({
                id: 123,
                type: IntegrationType.Gmail,
                meta: { address: 'test@gmail.com' },
            }),
        }

        it('shows advanced delivery settings section', () => {
            renderEmailSettings(gmailProps)

            expect(
                screen.getByText('Advanced delivery settings'),
            ).toBeInTheDocument()
        })

        it('shows Gmail categories toggle', () => {
            renderEmailSettings(gmailProps)

            expect(
                screen.getByText('Tag tickets with Gmail categories'),
            ).toBeInTheDocument()
            expect(
                screen.getByText(
                    'Categories include Social, Promotions, Updates and Forums.',
                ),
            ).toBeInTheDocument()
        })

        it('shows Gmail threading toggle', () => {
            renderEmailSettings(gmailProps)

            expect(
                screen.getByText('Group emails into conversations'),
            ).toBeInTheDocument()
            expect(
                screen.getByText((content) =>
                    content.includes(
                        'Group emails if they have the same recipients',
                    ),
                ),
            ).toBeInTheDocument()
        })

        it('shows deliverability settings and handles Gmail sending toggle', async () => {
            const user = userEvent.setup()
            const mockSetEnableGmailSending = jest.fn()

            renderEmailSettings({
                ...gmailProps,
                setEnableGmailSending: mockSetEnableGmailSending,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Send emails via Gmail API'),
            ).toBeInTheDocument()

            const gmailApiRadio = screen.getByLabelText(
                'Send emails via Gmail API',
            )
            await user.click(gmailApiRadio)

            expect(mockSetEnableGmailSending).toHaveBeenCalledWith(true)
        })

        it('does not show email imports section', () => {
            renderEmailSettings(gmailProps)

            expect(screen.queryByText('Email imports')).not.toBeInTheDocument()
            expect(screen.queryByText('Import emails')).not.toBeInTheDocument()
        })
    })

    describe('Outlook integration', () => {
        const outlookProps = {
            integration: fromJS({
                id: 123,
                type: IntegrationType.Outlook,
                meta: { address: 'test@outlook.com' },
            }),
        }

        it('shows advanced delivery settings section', () => {
            renderEmailSettings(outlookProps)

            expect(
                screen.getByText('Advanced delivery settings'),
            ).toBeInTheDocument()
        })

        it('does not show Gmail-specific toggles', () => {
            renderEmailSettings(outlookProps)

            expect(
                screen.queryByText('Tag tickets with Gmail categories'),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByText('Group emails into conversations'),
            ).not.toBeInTheDocument()
        })

        it('shows deliverability settings and handles Outlook sending toggle', async () => {
            const user = userEvent.setup()
            const mockSetEnableOutlookSending = jest.fn()

            renderEmailSettings({
                ...outlookProps,
                setEnableOutlookSending: mockSetEnableOutlookSending,
            })

            expect(
                screen.getByText('Outbound email delivery settings'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Send emails via Outlook API'),
            ).toBeInTheDocument()

            const outlookApiRadio = screen.getByLabelText(
                'Send emails via Outlook API',
            )
            await user.click(outlookApiRadio)

            expect(mockSetEnableOutlookSending).toHaveBeenCalledWith(true)
        })

        it('does not show email imports section', () => {
            renderEmailSettings(outlookProps)

            expect(screen.queryByText('Email imports')).not.toBeInTheDocument()
            expect(screen.queryByText('Import emails')).not.toBeInTheDocument()
        })
    })

    describe('Email integration', () => {
        const emailProps = {
            integration: fromJS({
                id: 123,
                type: IntegrationType.Email,
                meta: { address: 'test@example.com' },
            }),
        }

        it('does not show advanced delivery settings section', () => {
            renderEmailSettings(emailProps)

            expect(
                screen.queryByText('Advanced delivery settings'),
            ).not.toBeInTheDocument()
        })

        it('does not show email imports section', () => {
            renderEmailSettings(emailProps)

            expect(screen.queryByText('Email imports')).not.toBeInTheDocument()
        })

        it('shows email forwarding section', () => {
            renderEmailSettings(emailProps)

            expect(screen.getByText('Email forwarding')).toBeInTheDocument()
            expect(
                screen.getByText('Gorgias forwarding address'),
            ).toBeInTheDocument()
            expect(
                screen.getByDisplayValue('emails.gorgias.com'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: /copy/i }),
            ).toBeInTheDocument()
        })

        it('shows forwarding explanation text', () => {
            renderEmailSettings(emailProps)

            expect(
                screen.getByText((content) =>
                    content.includes(
                        'Configuring email forwarding improves the deliverability',
                    ),
                ),
            ).toBeInTheDocument()
            expect(
                screen.getByText((content) =>
                    content.includes(
                        'This Gorgias forwarding address routes emails',
                    ),
                ),
            ).toBeInTheDocument()
        })
    })

    describe('accordion functionality', () => {
        it('renders all accordion items for Gmail integration', () => {
            renderEmailSettings({
                integration: fromJS({
                    id: 123,
                    type: IntegrationType.Gmail,
                    meta: { address: 'test@gmail.com' },
                }),
            })

            expect(
                screen.getByText('Display name and signature'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('Advanced delivery settings'),
            ).toBeInTheDocument()
            expect(screen.queryByText('Email imports')).not.toBeInTheDocument()
            expect(
                screen.queryByText('Email forwarding'),
            ).not.toBeInTheDocument()
        })

        it('renders appropriate accordion items for Email integration', () => {
            renderEmailSettings({
                integration: fromJS({
                    id: 123,
                    type: IntegrationType.Email,
                    meta: { address: 'test@example.com' },
                }),
            })

            expect(
                screen.getByText('Display name and signature'),
            ).toBeInTheDocument()
            expect(
                screen.queryByText('Advanced delivery settings'),
            ).not.toBeInTheDocument()
            expect(screen.queryByText('Email imports')).not.toBeInTheDocument()
            expect(screen.getByText('Email forwarding')).toBeInTheDocument()
        })
    })

    describe('props and state management', () => {
        it('displays current name value in input field', () => {
            renderEmailSettings({ name: 'Custom Support Team' })

            const displayNameField = screen.getByRole('textbox', {
                name: /display name/i,
            })
            expect(displayNameField).toHaveValue('Custom Support Team')
        })

        it('reflects toggle states correctly', () => {
            renderEmailSettings({
                integration: fromJS({
                    id: 123,
                    type: IntegrationType.Gmail,
                    meta: { address: 'test@gmail.com' },
                }),
                useGmailCategories: true,
                enableGmailThreading: true,
            })

            const categoriesToggle = screen.getByRole('checkbox', {
                name: /tag tickets with gmail categories/i,
            })
            const threadingToggle = screen.getByRole('checkbox', {
                name: /group emails into conversations/i,
            })

            expect(categoriesToggle).toBeChecked()
            expect(threadingToggle).toBeChecked()
        })
    })
})

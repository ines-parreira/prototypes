import React, { ComponentProps } from 'react'

import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import {
    fireEvent,
    render,
    RenderResult,
    screen,
    waitFor,
} from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {
    EMAIL_INTEGRATION_TYPE,
    GMAIL_INTEGRATION_TYPE,
    OUTLOOK_INTEGRATION_TYPE,
} from 'constants/integration'
import { integrationsState } from 'fixtures/integrations'
import { IntegrationType } from 'models/integration/constants'
import {
    OutboundVerificationStatusValue,
    OutboundVerificationType,
} from 'models/integration/types'
import EmailIntegrationUpdateContainer from 'pages/integrations/integration/components/email/EmailIntegrationUpdate/EmailIntegrationUpdate'
import {
    getOutboundEmailProviderSettingKey,
    isBaseEmailAddress,
} from 'pages/integrations/integration/components/email/helpers'
import { INTEGRATION_REMOVAL_CONFIGURATION_TEXT } from 'pages/integrations/integration/constants'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('pages/integrations/integration/components/email/helpers')

jest.mock('hooks/useAppDispatch', () => {
    return () => jest.fn()
})

jest.mock('hooks/useAppSelector', () => {
    return (selector: any) => {
        const selectorStr = selector.toString()
        if (selectorStr.includes('domain')) {
            return 'test.com'
        }
        if (selectorStr.includes('forwarding')) {
            return 'emails.gorgias.com'
        }
        if (
            selectorStr.includes('getRedirectUri') ||
            selectorStr.includes('Gmail') ||
            selectorStr.includes('redirectUri') ||
            selectorStr.includes('redirect')
        ) {
            return 'https://gmail-redirect'
        }
        return 'https://gmail-redirect'
    }
})

jest.mock('pages/common/forms/RichFieldWithVariables', () => {
    return function MockRichFieldWithVariables({ onChange, label }: any) {
        return (
            <div>
                <label>{label}</label>
                <textarea
                    aria-label="signature-editor"
                    onChange={() => {
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

const isBaseEmailAddressMock = assumeMock(isBaseEmailAddress)

const queryClient = mockQueryClient()
const INTEGRATION_NAME = 'My Integration'

const commonProps: ComponentProps<typeof EmailIntegrationUpdateContainer> = {
    loading: fromJS({ integration: false }),
    integration: fromJS({}),
}

describe('<EmailIntegrationUpdateContainer />', () => {
    const mockStore = configureMockStore([thunk])
    let store: any
    let consoleSpy: jest.SpyInstance

    beforeEach(() => {
        store = mockStore({ integrations: fromJS(integrationsState) })
        isBaseEmailAddressMock.mockReturnValue(false)
        jest.clearAllMocks()
        consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
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

    const renderWithStore = (props = {}) =>
        render(
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <EmailIntegrationUpdateContainer
                        {...commonProps}
                        {...props}
                    />
                </Provider>
            </QueryClientProvider>,
        )

    it.each([
        {
            selector: ({ getByRole }: RenderResult) =>
                getByRole('textbox', {
                    name: /display name required/i,
                }),
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
        {
            selector: ({ getByRole }: RenderResult) =>
                getByRole('checkbox', {
                    name: /tag tickets with gmail categories/i,
                }),
            newValue: true,
            finalValue: false,
        },
    ])(
        'should enable the submit button only if form values changed [gmail]',
        async (selector) => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: GMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'myintegration@gorgias.io',
                        signature: {
                            text: '',
                            html: '<div><br></div>',
                        },
                        outbound_verification_status: {
                            [OutboundVerificationType.Domain]:
                                OutboundVerificationStatusValue.Success,
                        },
                        use_gmail_categories: false,
                        enable_gmail_sending: true,
                        enable_gmail_threading: true,
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const { getByRole } = helpers

            let saveButton: HTMLElement
            await waitFor(() => {
                saveButton = getByRole('button', { name: 'Save changes' })
                expect(saveButton).toBeInTheDocument()
            })

            if (typeof selector.newValue === 'boolean') {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: { value: selector.newValue },
                })
            }

            await waitFor(() => {
                expect(saveButton).toBeAriaEnabled()
            })

            if (typeof selector.newValue === 'boolean') {
                fireEvent.click(selector.selector(helpers))
            } else {
                fireEvent.change(selector.selector(helpers), {
                    target: { value: selector.finalValue },
                })
            }
        },
    )
    it.each([IntegrationType.Gmail, IntegrationType.Outlook])(
        'should enable the submit button only if email deliverability setting changed [%s]',
        async (integrationType) => {
            const props = {
                integration: fromJS({
                    id: 100,
                    name: INTEGRATION_NAME,
                    type: integrationType,
                    meta: {
                        address: 'test123@gorgias.com',
                        outbound_verification_status: {
                            [OutboundVerificationType.Domain]:
                                OutboundVerificationStatusValue.Success,
                        },
                        use_gmail_categories: true,
                        enable_gmail_threading: true,
                        [getOutboundEmailProviderSettingKey(
                            integrationType as
                                | IntegrationType.Gmail
                                | IntegrationType.Outlook,
                        )]: true,
                        enable_outlook_sending: true,
                        enable_gmail_sending: true,
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const { getByRole } = helpers
            const saveButton = getByRole('button', { name: 'Save changes' })

            await waitFor(() => {
                expect(saveButton).toBeAriaDisabled()
            })
        },
    )

    it.each([
        {
            selector: ({ getByRole }: RenderResult) =>
                getByRole('textbox', {
                    name: /display name required/i,
                }),
            newValue: 'Some New Name',
            finalValue: INTEGRATION_NAME,
        },
    ])(
        'should enable the submit button only if form values changed [email]',
        async (selector) => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'myintegration@gorgias.io',
                        signature: {
                            text: '',
                            html: '<div><br></div>',
                        },
                    },
                }),
            }

            const helpers = renderWithStore(props)
            const { getByRole } = helpers

            let saveButton: HTMLElement
            await waitFor(() => {
                saveButton = getByRole('button', { name: 'Save changes' })
                expect(saveButton).toBeInTheDocument()
            })

            fireEvent.change(selector.selector(helpers), {
                target: { value: selector.newValue },
            })

            await waitFor(() => {
                expect(saveButton).toBeAriaEnabled()
            })

            fireEvent.change(selector.selector(helpers), {
                target: { value: selector.finalValue },
            })
        },
    )

    it('should enable the submit button if form values change - integration has no signature [email]', async () => {
        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: EMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'myintegration@gorgias.io',
                },
            }),
        }

        const helpers = renderWithStore(props)
        const { getByRole } = helpers
        const displayNameInput = getByRole('textbox', {
            name: /display name required/i,
        })

        let saveButton: HTMLElement
        await waitFor(() => {
            saveButton = getByRole('button', { name: 'Save changes' })
            expect(saveButton).toBeInTheDocument()
        })

        fireEvent.change(displayNameInput, {
            target: { value: 'Some New Name' },
        })

        await waitFor(() => {
            expect(saveButton).toBeAriaEnabled()
        })

        fireEvent.change(displayNameInput, {
            target: { value: INTEGRATION_NAME },
        })
    })

    it('should not allow editing the display name and provide a tooltip [outlook]', async () => {
        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: OUTLOOK_INTEGRATION_TYPE,
                meta: {
                    address: 'support@gorgias.com',
                    signature: {
                        text: '',
                        html: '<div><br></div>',
                    },
                },
            }),
        }

        const { getByPlaceholderText, getByText } = renderWithStore(props)

        const displayNameInput = getByPlaceholderText('Test.com Support')
        expect(displayNameInput).toBeDisabled()

        const displayNameInfoIcon = getByText('info_outline')
        expect(displayNameInfoIcon).toBeInTheDocument()

        fireEvent.mouseOver(displayNameInfoIcon as Element)
        await waitFor(() => {
            const tooltip_ = screen.getByRole('tooltip')
            expect(tooltip_).toBeInTheDocument()
            const expectedTooltipLink =
                'https://learn.microsoft.com/en-us/microsoft-365/admin/add-users/' +
                'change-a-user-name-and-email-address?view=o365-worldwide' +
                '#watch-change-a-users-email-address-display-name-or-email-alias'
            expect(tooltip_.innerHTML).toContain(
                `href="${expectedTooltipLink}"`,
            )
        })
    })

    it.each([IntegrationType.Gmail, IntegrationType.Email])(
        'should allow editing the display name [%s]',
        (integrationType) => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: integrationType,
                    meta: {
                        address: 'support@gorgias.com',
                    },
                }),
            }

            const { getByPlaceholderText, queryByText } = renderWithStore(props)
            const displayNameInput = getByPlaceholderText('Test.com Support')
            expect(displayNameInput).toBeEnabled()

            const displayNameInfoIcon = queryByText('info_outline')
            expect(displayNameInfoIcon).not.toBeInTheDocument()
        },
    )

    it('should check the warning message of removing the integration, it should contain the text related to saved filters', () => {
        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: OUTLOOK_INTEGRATION_TYPE,
                meta: {
                    address: 'support@gorgias.com',
                    signature: {
                        text: '',
                        html: '<div><br></div>',
                    },
                },
            }),
        }

        const { getByText, getByRole } = renderWithStore(props)

        fireEvent.click(getByRole('button', { name: /Delete integration/i }))

        expect(
            getByText(INTEGRATION_REMOVAL_CONFIGURATION_TEXT),
        ).toBeInTheDocument()
    })

    it('should not display the "setup instructions" section for base email addresses', () => {
        isBaseEmailAddressMock.mockReturnValue(true)

        const props = {
            integration: fromJS({
                id: 1,
                name: INTEGRATION_NAME,
                type: EMAIL_INTEGRATION_TYPE,
                meta: {
                    address: 'abc@example.com',
                },
            }),
        }

        const { queryByText } = renderWithStore(props)
        expect(queryByText('Setup instructions')).not.toBeInTheDocument()
    })

    describe('Loading states', () => {
        it('should show loader when integration is loading', () => {
            const props = {
                loading: fromJS({ integration: true }),
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                }),
            }

            const { getByText } = renderWithStore(props)
            expect(() => getByText('General')).toThrow()
        })

        it('should not show loader when integration is not loading', () => {
            const props = {
                loading: fromJS({ integration: false }),
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                }),
            }

            const { getByText } = renderWithStore(props)
            expect(getByText('General')).toBeInTheDocument()
        })
    })

    describe('Component lifecycle and effects', () => {
        it('should initialize from integration when not initialized and not loading', async () => {
            const props = {
                loading: fromJS({ integration: false }),
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'test@example.com',
                        signature: {
                            text: 'Test signature',
                            html: '<p>Test signature</p>',
                        },
                    },
                }),
            }

            const { getByDisplayValue } = renderWithStore(props)

            await waitFor(() => {
                expect(getByDisplayValue(INTEGRATION_NAME)).toBeInTheDocument()
            })
        })
    })

    describe('Computed values (useMemo)', () => {
        it('should correctly compute isDeactivated', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Gmail,
                    deactivated_datetime: '2023-01-01T00:00:00Z',
                    meta: { address: 'test@gmail.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            expect(
                getByRole('button', { name: /Re-activate/i }),
            ).toBeInTheDocument()
        })

        it('should correctly compute isDeleting', () => {
            const props = {
                loading: fromJS({ delete: 1 }),
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const deleteButton = getByRole('button', {
                name: /Delete Integration/,
            })
            expect(deleteButton).toBeInTheDocument()
        })

        it('should correctly compute isSubmitting', () => {
            const props = {
                loading: fromJS({ updateIntegration: 1 }),
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const submitButton = getByRole('button', {
                name: /Save changes/,
            })
            expect(submitButton).toHaveAttribute('aria-disabled', 'true')
        })

        it('should correctly compute isGmail', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Gmail,
                    meta: {
                        address: 'test@gmail.com',
                        use_gmail_categories: false,
                        enable_gmail_threading: true,
                    },
                }),
            }

            const { getByText } = renderWithStore(props)

            expect(
                getByText('Tag tickets with Gmail categories'),
            ).toBeInTheDocument()
            expect(
                getByText('Group emails into conversations'),
            ).toBeInTheDocument()
        })
    })

    describe('Event handlers', () => {
        it('should handle form submission successfully', async () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'test@example.com',
                        signature: { text: '', html: '' },
                    },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            await waitFor(() => {
                const submitButton = getByRole('button', {
                    name: 'Save changes',
                })
                expect(submitButton).toBeAriaEnabled()
            })

            const submitButton = getByRole('button', { name: 'Save changes' })
            fireEvent.click(submitButton)

            expect(submitButton).toBeAriaEnabled()
        })

        it('should handle form submission errors', async () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'test@example.com',
                        signature: { text: '', html: '' },
                    },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            await waitFor(() => {
                const submitButton = getByRole('button', {
                    name: 'Save changes',
                })
                expect(submitButton).toBeAriaEnabled()
            })

            const submitButton = getByRole('button', { name: 'Save changes' })
            fireEvent.click(submitButton)

            expect(submitButton).toBeAriaEnabled()
        })

        it('should handle delete action', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const deleteButton = getByRole('button', {
                name: /Delete Integration/i,
            })
            fireEvent.click(deleteButton)

            expect(deleteButton).toBeInTheDocument()
        })

        it('should handle reactivate action for Gmail', () => {
            const mockWindowOpen = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            const props = {
                integration: fromJS({
                    id: 123,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Gmail,
                    deactivated_datetime: '2023-01-01T00:00:00Z',
                    meta: { address: 'test@gmail.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const reactivateButton = getByRole('button', {
                name: /Re-activate/i,
            })
            fireEvent.click(reactivateButton)

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://gmail-redirect?integration_id=123',
            )

            mockWindowOpen.mockRestore()
        })

        it('should handle cancel when form is dirty - show modal', async () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole, queryByText } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            const cancelButton = getByRole('button', { name: /Cancel/i })
            fireEvent.click(cancelButton)

            await waitFor(() => {
                expect(
                    queryByText('Discard unsaved changes?'),
                ).toBeInTheDocument()
            })
        })

        it('should handle cancel when form is not dirty - navigate directly', () => {
            const mockHistoryPush = jest.fn()
            jest.spyOn(
                require('pages/history').default,
                'push',
            ).mockImplementation(mockHistoryPush)

            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            const cancelButton = getByRole('button', { name: /Cancel/i })
            fireEvent.click(cancelButton)

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/channels/email',
            )
        })
    })

    describe('Modal interactions', () => {
        it('should show cancel modal when form is dirty', async () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole, queryByText } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            const cancelButton = getByRole('button', { name: /Cancel/i })
            fireEvent.click(cancelButton)

            await waitFor(() => {
                expect(
                    queryByText('Discard unsaved changes?'),
                ).toBeInTheDocument()
                expect(
                    queryByText(
                        'You have unsaved changes. Are you sure you want to leave without saving?',
                    ),
                ).toBeInTheDocument()
            })
        })

        it('should handle modal close (back to editing)', async () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole, queryByText } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            const cancelButton = getByRole('button', { name: /Cancel/i })
            fireEvent.click(cancelButton)

            await waitFor(() => {
                expect(
                    queryByText('Discard unsaved changes?'),
                ).toBeInTheDocument()
            })

            const backButton = getByRole('button', { name: 'Back to Editing' })
            fireEvent.click(backButton)

            await waitFor(() => {
                expect(
                    queryByText('Discard unsaved changes?'),
                ).not.toBeInTheDocument()
            })
        })

        it('should handle discard changes', async () => {
            const mockHistoryPush = jest.fn()
            jest.spyOn(
                require('pages/history').default,
                'push',
            ).mockImplementation(mockHistoryPush)

            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole, queryByText } = renderWithStore(props)

            const nameInput = getByRole('textbox', { name: /display name/i })
            fireEvent.change(nameInput, { target: { value: 'New Name' } })

            const cancelButton = getByRole('button', { name: /Cancel/i })
            fireEvent.click(cancelButton)

            await waitFor(() => {
                expect(
                    queryByText('Discard unsaved changes?'),
                ).toBeInTheDocument()
            })

            const discardButton = getByRole('button', {
                name: 'Discard Changes',
            })
            fireEvent.click(discardButton)

            expect(mockHistoryPush).toHaveBeenCalledWith(
                '/app/settings/channels/email',
            )
        })
    })

    describe('Component props and rendering', () => {
        it('should render all main sections for Gmail integration', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Gmail,
                    meta: {
                        address: 'test@gmail.com',
                        signature: { text: '', html: '' },
                    },
                }),
            }

            const { getByText } = renderWithStore(props)

            expect(getByText('General')).toBeInTheDocument()
            expect(getByText('Display name and signature')).toBeInTheDocument()
            expect(getByText('Advanced delivery settings')).toBeInTheDocument()
            expect(getByText('Email imports')).toBeInTheDocument()
        })

        it('should render correct sections for Email integration', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Email,
                    meta: {
                        address: 'test@example.com',
                        signature: { text: '', html: '' },
                    },
                }),
            }

            const { getByText, queryByText } = renderWithStore(props)

            expect(getByText('General')).toBeInTheDocument()
            expect(getByText('Display name and signature')).toBeInTheDocument()
            expect(getByText('Email forwarding')).toBeInTheDocument()
            expect(
                queryByText('Advanced delivery settings'),
            ).not.toBeInTheDocument()
            expect(queryByText('Email imports')).not.toBeInTheDocument()
        })

        it('should pass correct props to EmailSettings', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: {
                        address: 'test@example.com',
                        signature: { text: 'Test', html: '<p>Test</p>' },
                    },
                }),
            }

            const { getByDisplayValue } = renderWithStore(props)

            expect(getByDisplayValue(INTEGRATION_NAME)).toBeInTheDocument()
        })

        it('should pass correct props to EmailIntegrationButtons', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByRole } = renderWithStore(props)

            expect(
                getByRole('button', { name: 'Save changes' }),
            ).toBeInTheDocument()
            expect(getByRole('button', { name: /Cancel/i })).toBeInTheDocument()
            expect(
                getByRole('button', { name: /Delete integration/i }),
            ).toBeInTheDocument()
        })
    })

    describe('Integration types and features', () => {
        it('should handle Outlook integration correctly', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Outlook,
                    meta: {
                        address: 'test@outlook.com',
                        signature: { text: '', html: '' },
                    },
                }),
            }

            const { getByText, getByPlaceholderText } = renderWithStore(props)

            expect(getByText('Advanced delivery settings')).toBeInTheDocument()
            expect(getByText('Email imports')).toBeInTheDocument()

            const displayNameInput = getByPlaceholderText('Test.com Support')
            expect(displayNameInput).toBeDisabled()
        })
    })

    describe('Selectors and Redux integration', () => {
        it('should use correct selectors for domain', () => {
            const props = {
                integration: fromJS({
                    id: 1,
                    name: INTEGRATION_NAME,
                    type: EMAIL_INTEGRATION_TYPE,
                    meta: { address: 'test@example.com' },
                }),
            }

            const { getByPlaceholderText } = renderWithStore(props)

            expect(getByPlaceholderText('Test.com Support')).toBeInTheDocument()
        })

        it('should use correct selectors for Gmail redirect URI', () => {
            const props = {
                integration: fromJS({
                    id: 123,
                    name: INTEGRATION_NAME,
                    type: IntegrationType.Gmail,
                    deactivated_datetime: '2023-01-01T00:00:00Z',
                    meta: { address: 'test@gmail.com' },
                }),
            }

            const mockWindowOpen = jest
                .spyOn(window, 'open')
                .mockImplementation(() => null)

            const { getByRole } = renderWithStore(props)

            const reactivateButton = getByRole('button', {
                name: /Re-activate/i,
            })
            fireEvent.click(reactivateButton)

            expect(mockWindowOpen).toHaveBeenCalledWith(
                'https://gmail-redirect?integration_id=123',
            )

            mockWindowOpen.mockRestore()
        })
    })
})

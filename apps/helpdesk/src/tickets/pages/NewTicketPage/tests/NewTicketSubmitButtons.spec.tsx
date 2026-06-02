import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import { toast } from '@gorgias/axiom'

import { TicketStatus } from 'business/types/ticket'
import type { OutboundTranslationContextValue } from 'providers/OutboundTranslationProvider'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { NewTicketSubmitButtons } from '../components/NewTicketSubmitButtons'

jest.mock('@repo/tickets', () => {
    const getMockValidateTicketFields = jest.fn(() => ({
        hasErrors: false,
        invalidFieldIds: [],
    }))

    return {
        ...jest.requireActual('@repo/tickets'),
        getMacroTicketFieldValues: jest.fn(() => ({
            1: 'macro value',
        })),
        useTicketFieldsValidation: () => ({
            validateTicketFields: getMockValidateTicketFields,
            isValidating: false,
        }),
        getMockValidateTicketFields,
    }
})

jest.mock('providers/OutboundTranslationProvider', () => ({
    useOutboundTranslationContext: jest.fn().mockReturnValue({
        isTranslationPending: false,
    }),
}))

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Tooltip: jest.fn(() => null),
    TooltipContent: jest.fn(() => null),
}))

jest.mock('pages/common/components/button/ConfirmButton', () => ({
    __esModule: true,
    default: jest.fn(({ children, isDisabled, isLoading, onConfirm }) => (
        <button disabled={isDisabled} aria-busy={isLoading} onClick={onConfirm}>
            {children}
        </button>
    )),
}))

const useOutboundTranslationContext = jest.mocked(
    jest.requireMock<typeof import('providers/OutboundTranslationProvider')>(
        'providers/OutboundTranslationProvider',
    ).useOutboundTranslationContext,
)
const mockGetMacroTicketFieldValues = jest.mocked(
    jest.requireMock('@repo/tickets').getMacroTicketFieldValues,
)
const mockValidateTicketFields = jest.mocked(
    jest.requireMock('@repo/tickets').getMockValidateTicketFields,
)

const buildNewMessageState = ({
    bodyText = '',
    hasRecipients = true,
    isPublic = true,
    isLoading = false,
    isForward = false,
}: {
    bodyText?: string
    hasRecipients?: boolean
    isPublic?: boolean
    isLoading?: boolean
    isForward?: boolean
} = {}) =>
    fromJS({
        _internal: {
            loading: {
                submitMessage: isLoading,
            },
        },
        state: {
            contentState: null,
        },
        newMessage: {
            body_text: bodyText,
            body_html: bodyText ? `<p>${bodyText}</p>` : '',
            attachments: [],
            public: isPublic,
            source: {
                type: 'email',
                to: hasRecipients
                    ? [{ name: 'Customer', address: 'customer@test.com' }]
                    : [],
                extra: {
                    forward: isForward,
                },
            },
        },
    })

const buildTicketState = ({
    hasContentlessAction = false,
    appliedMacro = null,
}: {
    hasContentlessAction?: boolean
    appliedMacro?: unknown
} = {}) =>
    fromJS({
        subject: '',
        tags: [],
        state: {
            appliedMacro:
                appliedMacro ??
                (hasContentlessAction
                    ? {
                          actions: [{ name: 'set-tags' }],
                      }
                    : null),
        },
    })

const buildState = (
    options: {
        bodyText?: string
        hasRecipients?: boolean
        isPublic?: boolean
        isLoading?: boolean
        isForward?: boolean
        hasContentlessAction?: boolean
        appliedMacro?: unknown
    } = {},
) =>
    ({
        newMessage: buildNewMessageState(options),
        ticket: buildTicketState(options),
        currentUser: fromJS({
            account: { is_active: true },
        }),
        currentAccount: fromJS({
            status: { status: 'active' },
        }),
    }) as unknown as RootState

const renderComponent = (
    subject: string,
    stateOptions: Parameters<typeof buildState>[0] = {},
    submit = jest.fn(),
) => {
    const result = render(
        <Provider store={mockStore(buildState(stateOptions))}>
            <NewTicketSubmitButtons subject={subject} submit={submit} />
        </Provider>,
    )
    return { ...result, submit }
}

describe('NewTicketSubmitButtons', () => {
    afterEach(() => {
        toast.dismiss()
        jest.clearAllMocks()
        mockValidateTicketFields.mockReturnValue({
            hasErrors: false,
            invalidFieldIds: [],
        })
        mockGetMacroTicketFieldValues.mockReturnValue({
            1: 'macro value',
        })
    })

    describe('button text', () => {
        it('displays "Send" when there is message content', () => {
            renderComponent('My Subject', { bodyText: 'Hello' })

            expect(
                screen.getByRole('button', { name: 'Send' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Send & Close' }),
            ).toBeInTheDocument()
        })

        it('displays "Apply Macro" when there is no content but has a contentless action', () => {
            renderComponent('My Subject', {
                hasContentlessAction: true,
            })

            expect(
                screen.getByRole('button', { name: 'Apply Macro' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Apply Macro & Close' }),
            ).toBeInTheDocument()
        })

        it('displays "Send" when there is both content and contentless action', () => {
            renderComponent('My Subject', {
                bodyText: 'Hello',
                hasContentlessAction: true,
            })

            expect(
                screen.getByRole('button', { name: 'Send' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Send & Close' }),
            ).toBeInTheDocument()
        })
    })

    describe('confirm button behavior', () => {
        it('renders a confirm button when subject is empty', () => {
            const ConfirmButton = jest.requireMock(
                'pages/common/components/button/ConfirmButton',
            ).default

            renderComponent('', { bodyText: 'Hello' })

            expect(ConfirmButton).toHaveBeenCalledTimes(2)
            expect(ConfirmButton).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({
                    children: 'Send',
                    confirmationContent:
                        'Are you sure you want to create a ticket with no subject?',
                }),
                {},
            )
            expect(ConfirmButton).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({
                    children: 'Send & Close',
                    confirmationContent:
                        'Are you sure you want to create a ticket with no subject?',
                }),
                {},
            )
        })

        it('does not render a confirm button when the applied macro sets a subject', () => {
            const ConfirmButton = jest.requireMock(
                'pages/common/components/button/ConfirmButton',
            ).default

            renderComponent('', {
                bodyText: 'Hello',
                appliedMacro: {
                    actions: [
                        {
                            name: 'setSubject',
                            arguments: {
                                subject: 'Macro subject',
                            },
                        },
                    ],
                },
            })

            expect(ConfirmButton).not.toHaveBeenCalled()
            expect(
                screen.getByRole('button', { name: 'Send' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Send & Close' }),
            ).toBeInTheDocument()
        })
    })

    describe('send and close', () => {
        it('submits the new ticket with a closed status', async () => {
            const { submit, user } = renderComponent('Subject', {
                bodyText: 'Hello',
            })

            await user.click(
                screen.getByRole('button', { name: 'Send & Close' }),
            )

            expect(submit).toHaveBeenCalledWith({
                status: TicketStatus.Closed,
            })
        })

        it('validates ticket fields with applied macro values before submitting closed', async () => {
            const appliedMacro = {
                actions: [
                    {
                        name: 'set-ticket-field',
                        arguments: {
                            ticket_field_id: 1,
                            value: 'macro value',
                        },
                    },
                ],
            }
            const { user } = renderComponent('Subject', {
                bodyText: 'Hello',
                appliedMacro,
            })

            await user.click(
                screen.getByRole('button', { name: 'Send & Close' }),
            )

            expect(mockGetMacroTicketFieldValues).toHaveBeenCalledWith(
                appliedMacro,
            )
            expect(mockValidateTicketFields).toHaveBeenCalledWith({
                1: 'macro value',
            })
        })

        it('shows an error toast and does not submit the new ticket when closed status validation fails', async () => {
            mockValidateTicketFields.mockReturnValue({
                hasErrors: true,
                invalidFieldIds: [1],
            })

            const { submit, user } = renderComponent('Subject', {
                bodyText: 'Hello',
            })

            await user.click(
                screen.getByRole('button', { name: 'Send & Close' }),
            )

            expect(submit).not.toHaveBeenCalled()
            const toastEl = await screen.findByRole('status', {
                name: 'This ticket cannot be closed. Please fill the required fields.',
            })
            expect(toastEl).toHaveAttribute('data-intent', 'destructive')
        })

        it('submits the new ticket with a closed status after no-subject confirmation', async () => {
            const { submit, user } = renderComponent('', {
                bodyText: 'Hello',
            })

            await user.click(
                screen.getByRole('button', { name: 'Send & Close' }),
            )

            expect(submit).toHaveBeenCalledWith({
                status: TicketStatus.Closed,
            })
        })
    })

    describe('disabled state', () => {
        it('is disabled when canSend is false', () => {
            renderComponent('Subject', {
                bodyText: '',
                hasRecipients: false,
                isPublic: true,
            })

            for (const button of screen.getAllByRole('button')) {
                expect(button).toHaveAttribute('aria-disabled', 'true')
            }
        })

        it('is disabled when translation is pending', () => {
            useOutboundTranslationContext.mockReturnValue({
                isTranslationPending: true,
            } as OutboundTranslationContextValue)

            renderComponent('Subject', { bodyText: 'Hello' })

            for (const button of screen.getAllByRole('button')) {
                expect(button).toHaveAttribute('aria-disabled', 'true')
            }
        })

        it('is enabled when canSend is true and no translation pending', () => {
            useOutboundTranslationContext.mockReturnValue({
                isTranslationPending: false,
            } as OutboundTranslationContextValue)

            renderComponent('Subject', { bodyText: 'Hello' })

            for (const button of screen.getAllByRole('button')) {
                expect(button).not.toHaveAttribute('aria-disabled', 'true')
            }
        })
    })
})

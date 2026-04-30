import { render, screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'

import type { OutboundTranslationContextValue } from 'providers/OutboundTranslationProvider'
import type { RootState } from 'state/types'
import { mockStore } from 'utils/testing'

import { NewTicketSubmitButtons } from '../components/NewTicketSubmitButtons'

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
    default: jest.fn(({ children, isDisabled, isLoading }) => (
        <button disabled={isDisabled} aria-busy={isLoading}>
            {children}
        </button>
    )),
}))

const useOutboundTranslationContext = jest.mocked(
    jest.requireMock<typeof import('providers/OutboundTranslationProvider')>(
        'providers/OutboundTranslationProvider',
    ).useOutboundTranslationContext,
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
}: {
    hasContentlessAction?: boolean
} = {}) =>
    fromJS({
        subject: '',
        tags: [],
        state: {
            appliedMacro: hasContentlessAction
                ? {
                      actions: [{ name: 'set-tags' }],
                  }
                : null,
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
) =>
    render(
        <Provider store={mockStore(buildState(stateOptions))}>
            <NewTicketSubmitButtons subject={subject} />
        </Provider>,
    )

describe('NewTicketSubmitButtons', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    describe('button text', () => {
        it('displays "Send" when there is message content', () => {
            renderComponent('My Subject', { bodyText: 'Hello' })

            expect(
                screen.getByRole('button', { name: 'Send' }),
            ).toBeInTheDocument()
        })

        it('displays "Apply Macro" when there is no content but has a contentless action', () => {
            renderComponent('My Subject', {
                hasContentlessAction: true,
            })

            expect(
                screen.getByRole('button', { name: 'Apply Macro' }),
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
        })
    })

    describe('confirm button behavior', () => {
        it('renders a confirm button when subject is empty', () => {
            const ConfirmButton = jest.requireMock(
                'pages/common/components/button/ConfirmButton',
            ).default

            renderComponent('', { bodyText: 'Hello' })

            expect(ConfirmButton).toHaveBeenCalledWith(
                expect.objectContaining({
                    confirmationContent:
                        'Are you sure you want to create a ticket with no subject?',
                }),
                expect.anything(),
            )
        })
    })

    describe('disabled state', () => {
        it('is disabled when canSend is false', () => {
            renderComponent('Subject', {
                bodyText: '',
                hasRecipients: false,
                isPublic: true,
            })

            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-disabled',
                'true',
            )
        })

        it('is disabled when translation is pending', () => {
            useOutboundTranslationContext.mockReturnValue({
                isTranslationPending: true,
            } as OutboundTranslationContextValue)

            renderComponent('Subject', { bodyText: 'Hello' })

            expect(screen.getByRole('button')).toHaveAttribute(
                'aria-disabled',
                'true',
            )
        })

        it('is enabled when canSend is true and no translation pending', () => {
            useOutboundTranslationContext.mockReturnValue({
                isTranslationPending: false,
            } as OutboundTranslationContextValue)

            renderComponent('Subject', { bodyText: 'Hello' })

            expect(screen.getByRole('button')).not.toHaveAttribute(
                'aria-disabled',
                'true',
            )
        })
    })
})

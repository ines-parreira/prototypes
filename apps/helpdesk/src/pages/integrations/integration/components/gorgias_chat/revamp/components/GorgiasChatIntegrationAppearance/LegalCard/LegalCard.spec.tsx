import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { LegalCard } from './LegalCard'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useGorgiasChatCreationWizardContext: () => ({
            displayPage: jest.fn(),
            updateLegalDisclaimer: jest.fn(),
            openChat: jest.fn(),
            updateLegalDisclaimerEnabled: jest.fn(),
        }),
    }),
)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    CheckBoxField: ({
        label,
        value,
        onChange,
    }: {
        label: string
        value: boolean
        onChange: (value: boolean) => void
    }) => (
        <label>
            <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
            />
            {label}
        </label>
    ),
}))

jest.mock('pages/common/forms/RichField/TicketRichField', () => ({
    __esModule: true,
    default: ({
        value,
        onChange,
        'aria-label': ariaLabel,
        displayedActions,
        canDropFiles,
        canInsertInlineImages,
    }: {
        value: { html: string; text: string }
        onChange: (editorState: { getCurrentContent: () => string }) => void
        'aria-label': string
        displayedActions: string[]
        canDropFiles: boolean
        canInsertInlineImages: boolean
    }) => (
        <div
            data-displayed-actions={displayedActions?.join(',')}
            data-can-drop-files={String(canDropFiles)}
            data-can-insert-inline-images={String(canInsertInlineImages)}
        >
            <label>
                {ariaLabel}
                <textarea
                    defaultValue={value.html}
                    onChange={(e) => {
                        const text = e.target.value
                        onChange({ getCurrentContent: () => text })
                    }}
                />
            </label>
        </div>
    ),
}))

jest.mock('pages/common/draftjs/plugins/toolbar/types', () => ({
    ActionName: {
        Bold: 'bold',
        Italic: 'italic',
        Underline: 'underline',
        Link: 'link',
        Emoji: 'emoji',
    },
}))

jest.mock('utils/editor', () => ({
    convertToHTML: (content: string) => content,
}))

jest.mock('@repo/utils', () => ({
    sanitizeHtmlDefault: (html: string) => html,
}))

describe('LegalCard', () => {
    const defaultProps = {
        legalDisclaimerText: 'AI disclaimer content',
        legalDisclaimerEnabled: false,
        onLegalDisclaimerTextChange: jest.fn(),
        onLegalDisclaimerEnabledChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<LegalCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the section heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Legal disclaimer' }),
        ).toBeInTheDocument()
    })

    describe('Legal disclaimer field', () => {
        it('should render with the correct value', () => {
            renderComponent()

            expect(
                screen.getByDisplayValue('AI disclaimer content'),
            ).toBeInTheDocument()
        })

        it('should render with the correct aria-label', () => {
            renderComponent()

            expect(
                screen.getByLabelText('Legal disclaimer'),
            ).toBeInTheDocument()
        })

        it('should render with canDropFiles set to false', () => {
            const { container } = renderComponent()

            expect(
                container.querySelector('[data-can-drop-files="false"]'),
            ).toBeInTheDocument()
        })

        it('should render with canInsertInlineImages set to false', () => {
            const { container } = renderComponent()

            expect(
                container.querySelector(
                    '[data-can-insert-inline-images="false"]',
                ),
            ).toBeInTheDocument()
        })

        it('should render with the correct displayed actions', () => {
            const { container } = renderComponent()

            expect(
                container.querySelector('[data-displayed-actions]'),
            ).toHaveAttribute(
                'data-displayed-actions',
                'bold,italic,underline,link,emoji',
            )
        })

        it('should not render when legalDisclaimerText is undefined', () => {
            renderComponent({ legalDisclaimerText: undefined })

            expect(
                screen.queryByLabelText('Legal disclaimer'),
            ).not.toBeInTheDocument()
        })

        it('should call onLegalDisclaimerTextChange when value changes', async () => {
            const user = userEvent.setup()
            renderComponent({ legalDisclaimerText: '' })

            await user.type(
                screen.getByLabelText('Legal disclaimer'),
                'new text',
            )

            expect(
                defaultProps.onLegalDisclaimerTextChange,
            ).toHaveBeenLastCalledWith('new text')
        })
    })

    describe('Legal disclaimer checkbox', () => {
        it('should render unchecked when disabled', () => {
            renderComponent({ legalDisclaimerEnabled: false })

            expect(
                screen.getByRole('checkbox', {
                    name: /Show legal disclaimer to customers/,
                }),
            ).not.toBeChecked()
        })

        it('should render checked when enabled', () => {
            renderComponent({ legalDisclaimerEnabled: true })

            expect(
                screen.getByRole('checkbox', {
                    name: /Show legal disclaimer to customers/,
                }),
            ).toBeChecked()
        })

        it('should call onLegalDisclaimerEnabledChange when toggled', async () => {
            const user = userEvent.setup()
            renderComponent({ legalDisclaimerEnabled: false })

            await user.click(
                screen.getByRole('checkbox', {
                    name: /Show legal disclaimer to customers/,
                }),
            )

            expect(
                defaultProps.onLegalDisclaimerEnabledChange,
            ).toHaveBeenCalledWith(true)
        })
    })
})

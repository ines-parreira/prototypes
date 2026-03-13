import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useListIntegrations } from '@gorgias/helpdesk-queries'

import { ChatShopperExperienceCard } from './ChatShopperExperienceCard'

jest.mock('@gorgias/helpdesk-queries', () => ({
    useListIntegrations: jest.fn(),
}))

const mockUseListIntegrations = useListIntegrations as jest.MockedFunction<
    typeof useListIntegrations
>

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({
        children,
        className,
    }: {
        children: ReactNode
        className?: string
    }) => <p className={className}>{children}</p>,
    SelectField: <T extends { id: number; label: string }>({
        label,
        placeholder,
        items,
        value,
        onChange,
    }: {
        label: string
        placeholder?: string
        items: T[]
        value: T | undefined
        onChange: (option: T | undefined) => void
        children: (option: T) => ReactNode
    }) => (
        <div>
            <label htmlFor="email-select">{label}</label>
            <select
                id="email-select"
                value={value?.id ?? ''}
                onChange={(e) => {
                    const id = parseInt(e.target.value)
                    const item = items.find((i) => i.id === id)
                    onChange(item)
                }}
            >
                <option value="">{placeholder}</option>
                {items.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.label}
                    </option>
                ))}
            </select>
        </div>
    ),
    ListItem: ({ label }: { id: number; label: string }) => (
        <span>{label}</span>
    ),
    CheckBoxField: ({
        label,
        caption,
        value,
        onChange,
    }: {
        label: string
        caption?: string
        value: boolean
        onChange: (value: boolean) => void
        direction?: string
    }) => (
        <>
            <label>
                <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => onChange(e.target.checked)}
                />
                {label}
            </label>
            {caption && <span>{caption}</span>}
        </>
    ),
}))

const buildMockResponse = (
    integrations: Array<{ id: number; name: string; type: string }>,
) =>
    ({
        data: { data: { data: integrations } },
    }) as unknown as ReturnType<typeof useListIntegrations>

const emptyResponse = buildMockResponse([])

describe('ChatShopperExperienceCard', () => {
    const defaultProps = {
        linkedEmailIntegration: null,
        sendChatTranscript: false,
        sendCsat: false,
        onLinkedEmailIntegrationChange: jest.fn(),
        onSendChatTranscriptChange: jest.fn(),
        onSendCsatChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(
            <ChatShopperExperienceCard {...defaultProps} {...props} />,
        )
    }

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseListIntegrations.mockImplementation((params) => {
            if (params?.type === 'email') {
                return buildMockResponse([
                    { id: 1, name: 'Support Email', type: 'email' },
                ])
            }
            if (params?.type === 'gmail') {
                return buildMockResponse([
                    { id: 2, name: 'Sales Gmail', type: 'gmail' },
                ])
            }
            return emptyResponse
        })
    })

    it('should render the card heading', () => {
        renderComponent()

        expect(
            screen.getByRole('heading', { name: 'Shopper experience' }),
        ).toBeInTheDocument()
    })

    it('should render the card description', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Customize how customers experience chat after the conversation.',
            ),
        ).toBeInTheDocument()
    })

    it('should render the Connect email select field', () => {
        renderComponent()

        expect(screen.getByLabelText('Connect email')).toBeInTheDocument()
    })

    it('should render the select field caption', () => {
        renderComponent()

        expect(
            screen.getByText(
                'Select an email to send conversation transcripts, offline confirmations, and satisfaction surveys.',
            ),
        ).toBeInTheDocument()
    })

    it('should render email integrations from all email types as options', () => {
        renderComponent()

        expect(
            screen.getByRole('option', { name: 'Support Email' }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('option', { name: 'Sales Gmail' }),
        ).toBeInTheDocument()
    })

    it('should render the Send conversation transcripts checkbox', () => {
        renderComponent()

        expect(
            screen.getByLabelText('Send conversation transcripts to customers'),
        ).toBeInTheDocument()
    })

    it('should render the Send CSAT checkbox', () => {
        renderComponent()

        expect(screen.getByLabelText('Send CSAT')).toBeInTheDocument()
    })

    describe('Send conversation transcripts checkbox state', () => {
        it('should render checked when sendChatTranscript is true', () => {
            renderComponent({ sendChatTranscript: true })

            expect(
                screen.getByLabelText(
                    'Send conversation transcripts to customers',
                ),
            ).toBeChecked()
        })

        it('should render unchecked when sendChatTranscript is false', () => {
            renderComponent({ sendChatTranscript: false })

            expect(
                screen.getByLabelText(
                    'Send conversation transcripts to customers',
                ),
            ).not.toBeChecked()
        })

        it('should call onSendChatTranscriptChange when toggled on', async () => {
            const user = userEvent.setup()
            const onSendChatTranscriptChange = jest.fn()
            renderComponent({
                sendChatTranscript: false,
                onSendChatTranscriptChange,
            })

            await user.click(
                screen.getByLabelText(
                    'Send conversation transcripts to customers',
                ),
            )

            expect(onSendChatTranscriptChange).toHaveBeenCalledWith(true)
        })

        it('should call onSendChatTranscriptChange when toggled off', async () => {
            const user = userEvent.setup()
            const onSendChatTranscriptChange = jest.fn()
            renderComponent({
                sendChatTranscript: true,
                onSendChatTranscriptChange,
            })

            await user.click(
                screen.getByLabelText(
                    'Send conversation transcripts to customers',
                ),
            )

            expect(onSendChatTranscriptChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Send CSAT checkbox state', () => {
        it('should render checked when sendCsat is true', () => {
            renderComponent({ sendCsat: true })

            expect(screen.getByLabelText('Send CSAT')).toBeChecked()
        })

        it('should render unchecked when sendCsat is false', () => {
            renderComponent({ sendCsat: false })

            expect(screen.getByLabelText('Send CSAT')).not.toBeChecked()
        })

        it('should call onSendCsatChange when toggled on', async () => {
            const user = userEvent.setup()
            const onSendCsatChange = jest.fn()
            renderComponent({ sendCsat: false, onSendCsatChange })

            await user.click(screen.getByLabelText('Send CSAT'))

            expect(onSendCsatChange).toHaveBeenCalledWith(true)
        })

        it('should call onSendCsatChange when toggled off', async () => {
            const user = userEvent.setup()
            const onSendCsatChange = jest.fn()
            renderComponent({ sendCsat: true, onSendCsatChange })

            await user.click(screen.getByLabelText('Send CSAT'))

            expect(onSendCsatChange).toHaveBeenCalledWith(false)
        })
    })

    describe('Connect email select', () => {
        it('should show the selected email when linkedEmailIntegration matches an option', () => {
            renderComponent({ linkedEmailIntegration: 1 })

            expect(screen.getByRole('combobox')).toHaveValue('1')
        })

        it('should show empty when linkedEmailIntegration is null', () => {
            renderComponent({ linkedEmailIntegration: null })

            expect(screen.getByRole('combobox')).toHaveValue('')
        })

        it('should call onLinkedEmailIntegrationChange with the selected id', async () => {
            const user = userEvent.setup()
            const onLinkedEmailIntegrationChange = jest.fn()
            renderComponent({ onLinkedEmailIntegrationChange })

            await user.selectOptions(
                screen.getByRole('combobox'),
                screen.getByRole('option', { name: 'Sales Gmail' }),
            )

            expect(onLinkedEmailIntegrationChange).toHaveBeenCalledWith(2)
        })

        it('should render empty list when no integrations are available', () => {
            mockUseListIntegrations.mockReturnValue(emptyResponse)
            renderComponent()

            expect(
                screen.queryByRole('option', { name: 'Support Email' }),
            ).not.toBeInTheDocument()
        })

        it('should handle undefined data from useListIntegrations gracefully', () => {
            mockUseListIntegrations.mockReturnValue(
                {} as unknown as ReturnType<typeof useListIntegrations>,
            )
            renderComponent()

            expect(screen.getByRole('combobox')).toBeInTheDocument()
            expect(
                screen.queryByRole('option', { name: 'Support Email' }),
            ).not.toBeInTheDocument()
        })

        it('should format option as "Name <address>" when integration has an address', () => {
            mockUseListIntegrations.mockImplementation((params) => {
                if (params?.type === 'email') {
                    return {
                        data: {
                            data: {
                                data: [
                                    {
                                        id: 1,
                                        name: 'Support Email',
                                        meta: {
                                            address: 'support@example.com',
                                        },
                                    },
                                ],
                            },
                        },
                    } as unknown as ReturnType<typeof useListIntegrations>
                }
                return emptyResponse
            })
            renderComponent()

            expect(
                screen.getByRole('option', {
                    name: 'Support Email <support@example.com>',
                }),
            ).toBeInTheDocument()
        })

        it('should call onLinkedEmailIntegrationChange with null when selection is cleared', async () => {
            const user = userEvent.setup()
            const onLinkedEmailIntegrationChange = jest.fn()
            renderComponent({
                linkedEmailIntegration: 1,
                onLinkedEmailIntegrationChange,
            })

            await user.selectOptions(screen.getByRole('combobox'), '')

            expect(onLinkedEmailIntegrationChange).toHaveBeenCalledWith(null)
        })
    })
})

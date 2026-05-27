import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'

import { BrandCard } from './BrandCard'

const mockUpdateMainColor = jest.fn()
const mockUpdateConversationColor = jest.fn()
const mockUpdateIntroductionText = jest.fn()
const mockUpdateOfflineIntroductionText = jest.fn()
const mockOpenChat = jest.fn()
const mockDisplayPage = jest.fn()

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/common/components/ChatPreviewPanel/hooks/useChatPreviewPanel',
    () => ({
        useChatPreviewPanelContext: () => ({
            updateMainColor: (value: string) => mockUpdateMainColor(value),
            updateConversationColor: (value: string) =>
                mockUpdateConversationColor(value),
            updateHeaderPictureUrl: jest.fn(),
            updateHeaderAlternativePictureUrl: jest.fn(),
            updateIntroductionText: mockUpdateIntroductionText,
            updateOfflineIntroductionText: mockUpdateOfflineIntroductionText,
            openChat: mockOpenChat,
            closeChat: jest.fn(),
            displayPage: mockDisplayPage,
            updatePosition: jest.fn(),
            updateLauncher: jest.fn(),
            updateTexts: jest.fn(),
            updatePreviewTexts: jest.fn(),
            updateLegalDisclaimer: jest.fn(),
            updateLegalDisclaimerEnabled: jest.fn(),
        }),
    }),
)

type ColorPickerProps = {
    className?: string
    value: string
    defaultValue: string
    onChange: (value: string) => void
}

type LogoUploadProps = {
    url?: string
    onChange: (url?: string) => void
}

type CheckBoxFieldProps = {
    label: string
    value: boolean
    onChange: (value: boolean) => void
}

const mockColorPicker = jest.fn()
const mockLogoUpload = jest.fn()
const mockCheckBoxField = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
    CheckBoxField: (props: CheckBoxFieldProps) => {
        mockCheckBoxField(props)
        return null
    },
    TextField: ({
        label,
        value,
        onChange,
        onFocus,
    }: {
        label: string
        value: string
        onChange: (value: string) => void
        onFocus?: () => void
    }) => (
        <div>
            <label>{label}</label>
            <input
                aria-label={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                onFocus={onFocus}
            />
        </div>
    ),
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/ColorPicker',
    () => ({
        ColorPicker: (props: ColorPickerProps) => {
            mockColorPicker(props)
            return null
        },
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload',
    () => ({
        LogoUpload: (props: LogoUploadProps) => {
            mockLogoUpload(props)
            return null
        },
    }),
)

describe('BrandCard', () => {
    const defaultProps = {
        mainColor: '#FF0000',
        conversationColor: '#FF0000',
        useMainColorOutsideBusinessHours: false,
        headerPictureUrl: 'https://example.com/logo.png',
        headerAlternativePictureUrl: 'https://example.com/alternative-logo.png',
        introductionText: 'How can we help?',
        offlineIntroductionText: "We'll be back soon",
        onMainColorChange: jest.fn(),
        onConversationColorChange: jest.fn(),
        onUseMainColorOutsideBusinessHoursChange: jest.fn(),
        onHeaderLogoUrlChange: jest.fn(),
        onHeaderAlternativePictureUrlChange: jest.fn(),
        onIntroductionTextChange: jest.fn(),
        onOfflineIntroductionTextChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<BrandCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('ColorPicker', () => {
        it('should receive the current mainColor', () => {
            renderComponent()

            expect(mockColorPicker).toHaveBeenCalledWith(
                expect.objectContaining({
                    value: '#FF0000',
                    defaultValue: GORGIAS_CHAT_DEFAULT_COLOR,
                }),
            )
        })

        it('should call onMainColorChange and mirror to conversation color when showAdvancedColors is false', () => {
            renderComponent()

            const { onChange } = mockColorPicker.mock
                .calls[0][0] as ColorPickerProps
            onChange('#00FF00')

            expect(defaultProps.onMainColorChange).toHaveBeenCalledWith(
                '#00FF00',
            )
            expect(defaultProps.onConversationColorChange).toHaveBeenCalledWith(
                '#00FF00',
            )
            expect(mockUpdateMainColor).toHaveBeenCalledWith('#00FF00')
        })
    })

    describe('Advanced colors (AI agent disabled)', () => {
        it('should render both main and conversation color pickers when showAdvancedColors is true', () => {
            renderComponent({
                showAdvancedColors: true,
                mainColor: '#111111',
                conversationColor: '#222222',
            })

            expect(mockColorPicker).toHaveBeenCalledWith(
                expect.objectContaining({ value: '#111111' }),
            )
            expect(mockColorPicker).toHaveBeenCalledWith(
                expect.objectContaining({ value: '#222222' }),
            )
        })

        it('should call onMainColorChange without mirroring to conversation color', () => {
            renderComponent({ showAdvancedColors: true })

            const mainCall = mockColorPicker.mock.calls.find(
                ([props]: [ColorPickerProps]) => props.value === '#FF0000',
            )
            const { onChange } = mainCall?.[0] as ColorPickerProps
            onChange('#00FF00')

            expect(defaultProps.onMainColorChange).toHaveBeenCalledWith(
                '#00FF00',
            )
            expect(
                defaultProps.onConversationColorChange,
            ).not.toHaveBeenCalled()
            expect(mockUpdateMainColor).toHaveBeenCalledWith('#00FF00')
        })

        it('should call onConversationColorChange and sync the chat preview when the conversation color changes', () => {
            renderComponent({
                showAdvancedColors: true,
                conversationColor: '#AAAAAA',
            })

            const conversationCall = mockColorPicker.mock.calls.find(
                ([props]: [ColorPickerProps]) => props.value === '#AAAAAA',
            )
            const { onChange } = conversationCall?.[0] as ColorPickerProps
            onChange('#BBBBBB')

            expect(defaultProps.onConversationColorChange).toHaveBeenCalledWith(
                '#BBBBBB',
            )
            expect(mockUpdateConversationColor).toHaveBeenCalledWith('#BBBBBB')
            expect(defaultProps.onMainColorChange).not.toHaveBeenCalled()
        })

        it('should render the outside-business-hours checkbox with the current value', () => {
            renderComponent({
                showAdvancedColors: true,
                useMainColorOutsideBusinessHours: true,
            })

            expect(mockCheckBoxField).toHaveBeenCalledWith(
                expect.objectContaining({
                    label: 'Keep main color when outside business hours',
                    value: true,
                }),
            )
        })

        it('should call onUseMainColorOutsideBusinessHoursChange when the checkbox toggles', () => {
            renderComponent({ showAdvancedColors: true })

            const { onChange } = mockCheckBoxField.mock
                .calls[0][0] as CheckBoxFieldProps
            onChange(true)

            expect(
                defaultProps.onUseMainColorOutsideBusinessHoursChange,
            ).toHaveBeenCalledWith(true)
        })

        it('should not render the checkbox when showAdvancedColors is false', () => {
            renderComponent()

            expect(mockCheckBoxField).not.toHaveBeenCalled()
        })
    })

    describe('LogoUpload', () => {
        it('should receive the current headerPictureUrl', () => {
            renderComponent()

            expect(mockLogoUpload).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://example.com/logo.png',
                }),
            )
        })

        it('should call onHeaderLogoUrlChange when logo changes', () => {
            renderComponent()

            const { onChange } = mockLogoUpload.mock
                .calls[0][0] as LogoUploadProps
            onChange('https://example.com/new-logo.png')

            expect(defaultProps.onHeaderLogoUrlChange).toHaveBeenCalledWith(
                'https://example.com/new-logo.png',
            )
        })
    })

    describe('Alternative LogoUpload', () => {
        it('should receive the current headerAlternativePictureUrl', () => {
            renderComponent()

            expect(mockLogoUpload).toHaveBeenCalledWith(
                expect.objectContaining({
                    url: 'https://example.com/alternative-logo.png',
                }),
            )
        })

        it('should call onHeaderAlternativePictureUrlChange when alternative logo changes', () => {
            renderComponent()

            const alternativeCall = mockLogoUpload.mock.calls.find(
                ([props]: [LogoUploadProps]) =>
                    props.url === 'https://example.com/alternative-logo.png',
            )
            const { onChange } = alternativeCall?.[0] as LogoUploadProps
            onChange('https://example.com/new-alternative-logo.png')

            expect(
                defaultProps.onHeaderAlternativePictureUrlChange,
            ).toHaveBeenCalledWith(
                'https://example.com/new-alternative-logo.png',
            )
        })
    })

    describe('Greeting section', () => {
        it('should render the greeting inputs when AI Agent is disabled', () => {
            renderComponent({ isAiAgentEnabled: false })

            expect(
                screen.getByRole('textbox', { name: 'During business hours' }),
            ).toHaveValue('How can we help?')
            expect(
                screen.getByRole('textbox', { name: 'Outside business hours' }),
            ).toHaveValue("We'll be back soon")
        })

        it('should not render the greeting inputs when AI Agent is enabled', () => {
            renderComponent({ isAiAgentEnabled: true })

            expect(
                screen.queryByRole('textbox', {
                    name: 'During business hours',
                }),
            ).not.toBeInTheDocument()
            expect(
                screen.queryByRole('textbox', {
                    name: 'Outside business hours',
                }),
            ).not.toBeInTheDocument()
        })

        it('should call onIntroductionTextChange and push the live preview update when typing during business hours', () => {
            renderComponent({ isAiAgentEnabled: false })

            const input = screen.getByRole('textbox', {
                name: 'During business hours',
            })
            fireEvent.change(input, { target: { value: 'Hi there!' } })

            expect(defaultProps.onIntroductionTextChange).toHaveBeenCalledWith(
                'Hi there!',
            )
            expect(mockUpdateIntroductionText).toHaveBeenCalledWith('Hi there!')
        })

        it('should call onOfflineIntroductionTextChange and push the live preview update when typing outside business hours', () => {
            renderComponent({ isAiAgentEnabled: false })

            const input = screen.getByRole('textbox', {
                name: 'Outside business hours',
            })
            fireEvent.change(input, { target: { value: 'See you tomorrow' } })

            expect(
                defaultProps.onOfflineIntroductionTextChange,
            ).toHaveBeenCalledWith('See you tomorrow')
            expect(mockUpdateOfflineIntroductionText).toHaveBeenCalledWith(
                'See you tomorrow',
            )
        })

        it('should show the homepage preview when focusing a greeting input', async () => {
            const user = userEvent.setup()
            renderComponent({ isAiAgentEnabled: false })

            await user.click(
                screen.getByRole('textbox', {
                    name: 'During business hours',
                }),
            )

            expect(mockDisplayPage).toHaveBeenCalledWith('homepage')
            expect(mockOpenChat).toHaveBeenCalled()
        })
    })
})

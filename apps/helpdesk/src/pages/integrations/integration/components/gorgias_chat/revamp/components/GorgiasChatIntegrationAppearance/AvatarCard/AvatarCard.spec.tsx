import type { ChangeEvent, ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
    GorgiasChatAvatarImageType,
    GorgiasChatAvatarNameType,
} from 'models/integration/types'

import { AvatarCard } from './AvatarCard'

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/legacy/components/LogoUpload',
    () => ({
        LogoUpload: ({
            url,
            onChange,
        }: {
            url?: string
            onChange: (url?: string) => void
        }) => (
            <div>
                {url && <img src={url} alt="Logo" />}
                <button
                    onClick={() => onChange('https://example.com/new-logo.png')}
                >
                    Upload logo
                </button>
                {url && (
                    <button onClick={() => onChange(undefined)}>
                        Remove logo
                    </button>
                )}
            </div>
        ),
    }),
)

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
    RadioGroup: ({
        children,
        value,
        onChange,
    }: {
        children: ReactNode
        value: string
        onChange: (value: string) => void
    }) => (
        <div
            role="radiogroup"
            data-value={value}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.type === 'radio') onChange(e.target.value)
            }}
        >
            {children}
        </div>
    ),
    Radio: ({
        value,
        label,
        isDisabled,
    }: {
        value: string
        label: string
        isDisabled?: boolean
    }) => (
        <label>
            <input
                type="radio"
                value={value}
                disabled={isDisabled}
                onChange={() => {}}
            />
            {label}
        </label>
    ),
    TextField: ({
        value,
        onChange,
        className,
    }: {
        value: string
        onChange: (value: string) => void
        className?: string
    }) => (
        <input
            type="text"
            value={value}
            className={className}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Chat title input"
        />
    ),
}))

describe('AvatarCard', () => {
    const defaultAvatar = {
        imageType: GorgiasChatAvatarImageType.AGENT_PICTURE,
        nameType: GorgiasChatAvatarNameType.AGENT_FIRST_NAME,
        companyLogoUrl: 'https://example.com/logo.png',
    }

    const defaultProps = {
        name: 'Test Chat',
        avatar: defaultAvatar,
        onNameChange: jest.fn(),
        onAvatarChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<AvatarCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the section heading', () => {
        renderComponent()

        expect(
            screen.getByText('How your team appears to customers'),
        ).toBeInTheDocument()
    })

    describe('Name section', () => {
        it('should render all name type options', () => {
            renderComponent()

            expect(screen.getByLabelText('First name only')).toBeInTheDocument()
            expect(
                screen.getByLabelText('First name and last initial'),
            ).toBeInTheDocument()
            expect(screen.getByLabelText('Full name')).toBeInTheDocument()
            expect(screen.getByLabelText('Custom')).toBeInTheDocument()
        })

        it('should not show chat title input when nameType is not CHAT_TITLE', () => {
            renderComponent()

            expect(
                screen.queryByRole('textbox', { name: 'Chat title input' }),
            ).not.toBeInTheDocument()
        })

        it('should show chat title input when nameType is CHAT_TITLE', () => {
            renderComponent({
                avatar: {
                    ...defaultAvatar,
                    nameType: GorgiasChatAvatarNameType.CHAT_TITLE,
                },
            })

            expect(
                screen.getByRole('textbox', { name: 'Chat title input' }),
            ).toBeInTheDocument()
        })

        it('should display current name value in chat title input', () => {
            renderComponent({
                avatar: {
                    ...defaultAvatar,
                    nameType: GorgiasChatAvatarNameType.CHAT_TITLE,
                },
            })

            expect(
                screen.getByRole('textbox', { name: 'Chat title input' }),
            ).toHaveValue('Test Chat')
        })

        it('should call onAvatarChange with new nameType when a name radio is selected', async () => {
            const user = userEvent.setup()
            const onAvatarChange = jest.fn()
            renderComponent({ onAvatarChange })

            await user.click(screen.getByLabelText('Full name'))

            expect(onAvatarChange).toHaveBeenCalledWith({
                ...defaultAvatar,
                nameType: GorgiasChatAvatarNameType.AGENT_FULLNAME,
            })
        })

        it('should call onNameChange when chat title input value changes', async () => {
            const user = userEvent.setup()
            const onNameChange = jest.fn()
            renderComponent({
                avatar: {
                    ...defaultAvatar,
                    nameType: GorgiasChatAvatarNameType.CHAT_TITLE,
                },
                onNameChange,
            })

            await user.type(
                screen.getByRole('textbox', { name: 'Chat title input' }),
                'x',
            )

            expect(onNameChange).toHaveBeenCalledWith('Test Chatx')
        })
    })

    describe('Profile picture section', () => {
        it('should render all image type options', () => {
            renderComponent()

            expect(screen.getByLabelText('Profile picture')).toBeInTheDocument()
            expect(screen.getByLabelText('Initials')).toBeInTheDocument()
            expect(screen.getByLabelText('Logo')).toBeInTheDocument()
        })

        it('should disable Logo option when no companyLogoUrl', () => {
            renderComponent({
                avatar: {
                    ...defaultAvatar,
                    companyLogoUrl: undefined,
                },
            })

            expect(screen.getByLabelText('Logo')).toBeDisabled()
        })

        it('should enable Logo option when companyLogoUrl is set', () => {
            renderComponent()

            expect(screen.getByLabelText('Logo')).not.toBeDisabled()
        })

        it('should call onAvatarChange with new imageType when an image radio is selected', async () => {
            const user = userEvent.setup()
            const onAvatarChange = jest.fn()
            renderComponent({ onAvatarChange })

            await user.click(screen.getByLabelText('Initials'))

            expect(onAvatarChange).toHaveBeenCalledWith({
                ...defaultAvatar,
                imageType: GorgiasChatAvatarImageType.AGENT_INITIALS,
            })
        })
    })

    describe('Avatar logo section', () => {
        it('should render the avatar logo heading', () => {
            renderComponent()

            expect(screen.getByText('Avatar logo')).toBeInTheDocument()
        })

        it('should show logo preview when companyLogoUrl is set', () => {
            renderComponent()

            expect(screen.getByAltText('Logo')).toBeInTheDocument()
        })

        it('should not show logo preview when companyLogoUrl is not set', () => {
            renderComponent({
                avatar: { ...defaultAvatar, companyLogoUrl: undefined },
            })

            expect(screen.queryByAltText('Logo')).not.toBeInTheDocument()
        })

        it('should call onAvatarChange with new companyLogoUrl when logo is uploaded', async () => {
            const user = userEvent.setup()
            const onAvatarChange = jest.fn()
            renderComponent({ onAvatarChange })

            await user.click(
                screen.getByRole('button', { name: 'Upload logo' }),
            )

            expect(onAvatarChange).toHaveBeenCalledWith({
                ...defaultAvatar,
                companyLogoUrl: 'https://example.com/new-logo.png',
            })
        })

        it('should call onAvatarChange with undefined companyLogoUrl when logo is removed', async () => {
            const user = userEvent.setup()
            const onAvatarChange = jest.fn()
            renderComponent({ onAvatarChange })

            await user.click(
                screen.getByRole('button', { name: 'Remove logo' }),
            )

            expect(onAvatarChange).toHaveBeenCalledWith({
                ...defaultAvatar,
                companyLogoUrl: undefined,
            })
        })
    })
})

import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import type { GorgiasChatPosition } from 'models/integration/types'
import {
    GorgiasChatLauncherType,
    GorgiasChatPositionAlignmentEnum,
} from 'models/integration/types'
import type { GorgiasChatLauncherSettings } from 'pages/integrations/integration/components/gorgias_chat/revamp/hooks/useAppearanceForm'

import { ChatLauncherCard } from './ChatLauncherCard'

type LauncherPositionPickerProps = {
    value: GorgiasChatPosition
    onChange: (position: GorgiasChatPosition) => void
}

const mockLauncherPositionPicker = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode; variant?: string }) => (
        <span>{children}</span>
    ),
    TextField: ({
        label,
        value,
        onChange,
        caption,
        isRequired,
    }: {
        label: string
        value: string
        onChange: (value: string) => void
        caption?: string
        isRequired?: boolean
    }) => (
        <div>
            <label>
                {label}
                {isRequired && ' *'}
            </label>
            <input
                aria-label={label}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            {caption && <span>{caption}</span>}
        </div>
    ),
    Icon: () => null,
}))

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/GorgiasChatIntegrationAppearance/revamp/components/LauncherPreview',
    () => ({
        LauncherPreview: ({
            fillColor,
            label,
        }: {
            fillColor: string
            label?: string
        }) => (
            <div
                data-testid="launcher-preview"
                data-fill-color={fillColor}
                data-label={label}
            />
        ),
    }),
)

jest.mock(
    'pages/integrations/integration/components/gorgias_chat/revamp/components/GorgiasChatIntegrationAppearance/LauncherPositionPicker/LauncherPositionPicker',
    () => ({
        LauncherPositionPicker: (props: LauncherPositionPickerProps) => {
            mockLauncherPositionPicker(props)
            return null
        },
    }),
)

describe('ChatLauncherCard', () => {
    const defaultPosition: GorgiasChatPosition = {
        alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_RIGHT,
        offsetX: 0,
        offsetY: 0,
    }

    const defaultLauncher: GorgiasChatLauncherSettings = {
        type: GorgiasChatLauncherType.ICON,
        label: '',
    }

    const defaultProps = {
        launcher: defaultLauncher,
        mainColor: '#FF6B6B',
        position: defaultPosition,
        onLauncherChange: jest.fn(),
        onPositionChange: jest.fn(),
    }

    const renderComponent = (props = {}) => {
        return render(<ChatLauncherCard {...defaultProps} {...props} />)
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the card heading and description', () => {
        renderComponent()

        expect(screen.getByText('Chat launcher')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Customize how the chat launcher appears on your website.',
            ),
        ).toBeInTheDocument()
    })

    describe('launcher appearance type selector', () => {
        it('should render both type options', () => {
            renderComponent()

            expect(
                screen.getByRole('button', { name: 'Icon only' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('button', { name: 'Icon and label' }),
            ).toBeInTheDocument()
        })

        it('should call onLauncherChange with ICON type when "Icon only" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent({
                launcher: {
                    ...defaultLauncher,
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                },
            })

            await user.click(screen.getByRole('button', { name: 'Icon only' }))

            expect(defaultProps.onLauncherChange).toHaveBeenCalledWith(
                expect.objectContaining({ type: GorgiasChatLauncherType.ICON }),
            )
        })

        it('should call onLauncherChange with ICON_AND_LABEL type when "Icon and label" is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(
                screen.getByRole('button', { name: 'Icon and label' }),
            )

            expect(defaultProps.onLauncherChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                }),
            )
        })

        it('should render two launcher previews with the provided mainColor', () => {
            renderComponent()

            const previews = screen.getAllByTestId('launcher-preview')
            expect(previews).toHaveLength(2)
            previews.forEach((preview) => {
                expect(preview).toHaveAttribute(
                    'data-fill-color',
                    defaultProps.mainColor,
                )
            })
        })

        it('should show "Chat with us" fallback label in the icon and label preview when label is empty', () => {
            renderComponent()

            const previews = screen.getAllByTestId('launcher-preview')
            expect(previews[1]).toHaveAttribute('data-label', 'Chat with us')
        })

        it('should show the current label in the icon and label preview', () => {
            renderComponent({
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: 'Chat with us',
                },
            })

            const previews = screen.getAllByTestId('launcher-preview')
            expect(previews[1]).toHaveAttribute('data-label', 'Chat with us')
        })
    })

    describe('label input', () => {
        it('should not render label input when type is ICON', () => {
            renderComponent()

            expect(
                screen.queryByRole('textbox', { name: /label/i }),
            ).not.toBeInTheDocument()
        })

        it('should render label input when type is ICON_AND_LABEL', () => {
            renderComponent({
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: 'Shop with AI',
                },
            })

            expect(
                screen.getByRole('textbox', { name: /label/i }),
            ).toBeInTheDocument()
        })

        it('should display current label value', () => {
            renderComponent({
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: 'Shop with AI',
                },
            })

            expect(screen.getByRole('textbox', { name: /label/i })).toHaveValue(
                'Shop with AI',
            )
        })

        it('should show character count caption', () => {
            renderComponent({
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: 'Shop with AI',
                },
            })

            expect(
                screen.getByText('12/20 characters · Short labels work best'),
            ).toBeInTheDocument()
        })

        it('should call onLauncherChange when label is changed', async () => {
            const user = userEvent.setup()
            renderComponent({
                launcher: {
                    type: GorgiasChatLauncherType.ICON_AND_LABEL,
                    label: '',
                },
            })

            await user.type(
                screen.getByRole('textbox', { name: /label/i }),
                'Hello',
            )

            expect(defaultProps.onLauncherChange).toHaveBeenCalled()
        })
    })

    describe('LauncherPositionPicker', () => {
        it('should receive the current position', () => {
            renderComponent()

            expect(mockLauncherPositionPicker).toHaveBeenCalledWith(
                expect.objectContaining({ value: defaultPosition }),
            )
        })

        it('should call onPositionChange when position changes', () => {
            renderComponent()

            const { onChange } = mockLauncherPositionPicker.mock
                .calls[0][0] as LauncherPositionPickerProps
            const newPosition: GorgiasChatPosition = {
                alignment: GorgiasChatPositionAlignmentEnum.BOTTOM_LEFT,
                offsetX: 5,
                offsetY: 10,
            }
            onChange(newPosition)

            expect(defaultProps.onPositionChange).toHaveBeenCalledWith(
                newPosition,
            )
        })
    })
})

import type { ReactNode } from 'react'

import { render } from '@testing-library/react'

import { GORGIAS_CHAT_DEFAULT_COLOR } from 'config/integrations/gorgias_chat'

import { BrandCard } from './BrandCard'

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

const mockColorPicker = jest.fn()
const mockLogoUpload = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Card: ({ children }: { children: ReactNode }) => <div>{children}</div>,
    Elevation: { Mid: 'mid' },
    Heading: ({ children }: { children: ReactNode }) => <h2>{children}</h2>,
    Text: ({ children }: { children: ReactNode }) => <span>{children}</span>,
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
        headerPictureUrl: 'https://example.com/logo.png',
        onMainColorChange: jest.fn(),
        onHeaderLogoUrlChange: jest.fn(),
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

        it('should call onMainColorChange when color changes', () => {
            renderComponent()

            const { onChange } = mockColorPicker.mock
                .calls[0][0] as ColorPickerProps
            onChange('#00FF00')

            expect(defaultProps.onMainColorChange).toHaveBeenCalledWith(
                '#00FF00',
            )
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
})

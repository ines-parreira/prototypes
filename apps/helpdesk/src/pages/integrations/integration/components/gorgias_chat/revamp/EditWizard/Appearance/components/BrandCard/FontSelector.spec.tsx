import type { ReactNode } from 'react'

import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { FontSelector } from './FontSelector'

const AGENT_ADDED_FONTS_KEY = 'gorgias.agent-added-fonts'

type FontCatalogueModalProps = {
    recentlyAddedFonts: string[]
    setFontsFromLocalStorage: (fonts: string[]) => void
    isModalOpen: boolean
    setIsModalOpen: (val: boolean) => void
    currentPrimaryFont: string
}

const mockFontCatalogueModal = jest.fn()

jest.mock(
    'pages/settings/common/FontSelectField/components/FontCatalogueModal/FontCatalogueModal',
    () => ({
        FontCatalogueModal: (props: FontCatalogueModalProps) => {
            mockFontCatalogueModal(props)
            return null
        },
        getMultipleFontLink: (fonts: string[]) =>
            `https://fonts.googleapis.com/css2?family=${fonts.join('&family=')}&display=swap`,
    }),
)

const mockSelectField = jest.fn()

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    SelectField: ({
        items,
        value,
        onChange,
        header,
        children,
        'aria-label': ariaLabel,
    }: any) => {
        mockSelectField({ items, value, onChange, ariaLabel })
        return (
            <div>
                {header}
                {items.map((section: any) => (
                    <div key={section.id}>{children(section)}</div>
                ))}
            </div>
        )
    },
    ListSection: ({ name, items, children }: any) => (
        <div>
            {name && <span>{name}</span>}
            {items.map((item: any) => (
                <div key={item.id}>{children(item)}</div>
            ))}
        </div>
    ),
    ListItem: ({ textValue }: any) => <span>{textValue}</span>,
    ListHeader: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
    ),
    ListHeaderItem: ({
        label,
        onClick,
    }: {
        label: string
        onClick: () => void
    }) => <button onClick={onClick}>{label}</button>,
}))

describe('FontSelector', () => {
    const defaultProps = {
        mainFontFamily: 'Inter',
        onMainFontFamilyChange: jest.fn(),
    }

    const renderComponent = (props: Partial<typeof defaultProps> = {}) =>
        render(<FontSelector {...defaultProps} {...props} />)

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        document
            .querySelectorAll('link[rel="stylesheet"]')
            .forEach((el) => el.remove())
    })

    it('should render the More fonts button', () => {
        renderComponent()

        expect(
            screen.getByRole('button', { name: 'More fonts' }),
        ).toBeInTheDocument()
    })

    it('should pass the current mainFontFamily as the selected value', () => {
        renderComponent({ mainFontFamily: 'Georgia' })

        expect(mockSelectField).toHaveBeenCalledWith(
            expect.objectContaining({ value: { id: 'Georgia' } }),
        )
    })

    it('should call onMainFontFamilyChange when a font is selected', () => {
        renderComponent()

        const { onChange } = mockSelectField.mock.calls[0][0]
        onChange({ id: 'Roboto' })

        expect(defaultProps.onMainFontFamilyChange).toHaveBeenCalledWith(
            'Roboto',
        )
    })

    describe('font sections', () => {
        it('should render all fonts in a flat list without section headers when no recently added fonts exist', () => {
            renderComponent({ mainFontFamily: 'Inter' })

            expect(screen.queryByText('RECENTLY ADDED')).not.toBeInTheDocument()
            expect(screen.queryByText('STANDARD FONTS')).not.toBeInTheDocument()
            expect(screen.getByText('Arial')).toBeInTheDocument()
            expect(screen.getByText('Inter')).toBeInTheDocument()
        })

        it('should not show section headers when the only recently added font is the currently selected font', () => {
            renderComponent({ mainFontFamily: 'CustomFont' })

            expect(screen.queryByText('RECENTLY ADDED')).not.toBeInTheDocument()
            expect(screen.queryByText('STANDARD FONTS')).not.toBeInTheDocument()
        })

        it('should show RECENTLY ADDED and STANDARD FONTS sections when fonts exist in localStorage', () => {
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            expect(screen.getByText('RECENTLY ADDED')).toBeInTheDocument()
            expect(screen.getByText('STANDARD FONTS')).toBeInTheDocument()
        })

        it('should list all localStorage fonts under RECENTLY ADDED', () => {
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto', 'Lato']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            expect(screen.getByText('RECENTLY ADDED')).toBeInTheDocument()
            expect(screen.getByText('Roboto')).toBeInTheDocument()
            expect(screen.getByText('Lato')).toBeInTheDocument()
        })

        it('should include a non-default selected font in the RECENTLY ADDED section alongside localStorage fonts', () => {
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Lato']),
            )

            renderComponent({ mainFontFamily: 'CustomFont' })

            expect(screen.getByText('RECENTLY ADDED')).toBeInTheDocument()
            expect(screen.getByText('CustomFont')).toBeInTheDocument()
            expect(screen.getByText('Lato')).toBeInTheDocument()
        })
    })

    describe('FontCatalogueModal', () => {
        it('should render FontCatalogueModal with isModalOpen false by default', () => {
            renderComponent()

            expect(mockFontCatalogueModal).toHaveBeenCalledWith(
                expect.objectContaining({ isModalOpen: false }),
            )
        })

        it('should open FontCatalogueModal when More fonts is clicked', async () => {
            const user = userEvent.setup()
            renderComponent()

            await user.click(screen.getByRole('button', { name: 'More fonts' }))

            expect(mockFontCatalogueModal).toHaveBeenLastCalledWith(
                expect.objectContaining({ isModalOpen: true }),
            )
        })

        it('should pass the current font as currentPrimaryFont to FontCatalogueModal', () => {
            renderComponent({ mainFontFamily: 'Georgia' })

            expect(mockFontCatalogueModal).toHaveBeenCalledWith(
                expect.objectContaining({ currentPrimaryFont: 'Georgia' }),
            )
        })

        it('should pass recentlyAddedFonts from localStorage to FontCatalogueModal', () => {
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto', 'Lato']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            expect(mockFontCatalogueModal).toHaveBeenCalledWith(
                expect.objectContaining({
                    recentlyAddedFonts: expect.arrayContaining([
                        'Roboto',
                        'Lato',
                    ]),
                }),
            )
        })
    })

    describe('font link download', () => {
        it('should not add a font download link when using a default font with no localStorage fonts', () => {
            renderComponent({ mainFontFamily: 'Inter' })

            expect(document.querySelector('link[rel="stylesheet"]')).toBeNull()
        })

        it('should add a font download link when fonts exist in localStorage', () => {
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            const link = document.querySelector('link[rel="stylesheet"]')
            expect(link).not.toBeNull()
            expect(link?.getAttribute('href')).toContain('Roboto')
        })

        it('should include a non-default selected font in the font download link', () => {
            renderComponent({ mainFontFamily: 'CustomFont' })

            const link = document.querySelector('link[rel="stylesheet"]')
            expect(link).not.toBeNull()
            expect(link?.getAttribute('href')).toContain('CustomFont')
        })
    })
})

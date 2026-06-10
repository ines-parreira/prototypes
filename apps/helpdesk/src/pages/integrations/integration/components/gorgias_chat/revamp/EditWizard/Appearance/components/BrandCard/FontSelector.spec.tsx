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

describe('FontSelector', () => {
    const defaultProps = {
        mainFontFamily: 'Inter',
        onMainFontFamilyChange: jest.fn(),
    }

    const renderComponent = (props: Partial<typeof defaultProps> = {}) =>
        render(<FontSelector {...defaultProps} {...props} />)

    const openFontDropdown = async (user: ReturnType<typeof userEvent.setup>) =>
        user.click(screen.getByRole('textbox', { name: 'Font family' }))

    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        document
            .querySelectorAll('link[rel="stylesheet"]')
            .forEach((el) => el.remove())
    })

    it('should render the More fonts button', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openFontDropdown(user)

        expect(
            await screen.findByRole('button', { name: /more fonts/i }),
        ).toBeInTheDocument()
    })

    it('should display the current mainFontFamily as the selected value', () => {
        renderComponent({ mainFontFamily: 'Georgia' })

        expect(
            screen.getByRole('textbox', { name: 'Font family' }),
        ).toHaveValue('Georgia')
    })

    it('should call onMainFontFamilyChange when a font is selected', async () => {
        const user = userEvent.setup()
        renderComponent()

        await openFontDropdown(user)
        await user.click(await screen.findByRole('option', { name: 'Georgia' }))

        expect(defaultProps.onMainFontFamilyChange).toHaveBeenCalledWith(
            'Georgia',
        )
    })

    describe('font sections', () => {
        it('should render all fonts in a flat list without section headers when no recently added fonts exist', async () => {
            const user = userEvent.setup()
            renderComponent({ mainFontFamily: 'Inter' })

            await openFontDropdown(user)

            expect(
                await screen.findByRole('option', { name: 'Arial' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Inter' }),
            ).toBeInTheDocument()
            expect(screen.queryByText('RECENTLY ADDED')).not.toBeInTheDocument()
            expect(screen.queryByText('STANDARD FONTS')).not.toBeInTheDocument()
        })

        it('should not show section headers when the only recently added font is the currently selected font', async () => {
            const user = userEvent.setup()
            renderComponent({ mainFontFamily: 'CustomFont' })

            await openFontDropdown(user)

            expect(
                await screen.findByRole('option', { name: 'CustomFont' }),
            ).toBeInTheDocument()
            expect(screen.queryByText('RECENTLY ADDED')).not.toBeInTheDocument()
            expect(screen.queryByText('STANDARD FONTS')).not.toBeInTheDocument()
        })

        it('should show RECENTLY ADDED and STANDARD FONTS sections when fonts exist in localStorage', async () => {
            const user = userEvent.setup()
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            await openFontDropdown(user)

            expect(
                await screen.findByText('RECENTLY ADDED'),
            ).toBeInTheDocument()
            expect(screen.getByText('STANDARD FONTS')).toBeInTheDocument()
        })

        it('should list all localStorage fonts under RECENTLY ADDED', async () => {
            const user = userEvent.setup()
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Roboto', 'Lato']),
            )

            renderComponent({ mainFontFamily: 'Inter' })

            await openFontDropdown(user)

            expect(
                await screen.findByText('RECENTLY ADDED'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Roboto' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Lato' }),
            ).toBeInTheDocument()
        })

        it('should include a non-default selected font in the RECENTLY ADDED section alongside localStorage fonts', async () => {
            const user = userEvent.setup()
            localStorage.setItem(
                AGENT_ADDED_FONTS_KEY,
                JSON.stringify(['Lato']),
            )

            renderComponent({ mainFontFamily: 'CustomFont' })

            await openFontDropdown(user)

            expect(
                await screen.findByText('RECENTLY ADDED'),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'CustomFont' }),
            ).toBeInTheDocument()
            expect(
                screen.getByRole('option', { name: 'Lato' }),
            ).toBeInTheDocument()
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

            await openFontDropdown(user)
            await user.click(
                await screen.findByRole('button', { name: /more fonts/i }),
            )

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

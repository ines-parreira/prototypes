import { act, render, screen, waitFor, within } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import type { Language } from '../LanguagePicker'
import { LanguagePicker } from '../LanguagePicker'

jest.mock('@gorgias/axiom', () => ({
    ...jest.requireActual('@gorgias/axiom'),
    Icon: ({ name }: { name: string }) => <span data-testid={`icon-${name}`} />,
}))

const mockAvailableLanguages: Language[] = [
    { value: 'en-US', label: 'English (US)' },
    { value: 'fr-FR', label: 'French' },
    { value: 'de-DE', label: 'German' },
    { value: 'es-ES', label: 'Spanish' },
]

const defaultProps = {
    languages: [{ value: 'en-US', label: 'English (US)', isDefault: true }],
    availableLanguages: mockAvailableLanguages,
    onSelectLanguageChange: jest.fn(),
}

describe('<LanguagePicker />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render with default language selected', () => {
        render(<LanguagePicker {...defaultProps} />)

        expect(screen.getByText('Default language')).toBeInTheDocument()
        expect(screen.getAllByText('English (US)').length).toBeGreaterThan(0)
    })

    it('should render with custom label', () => {
        render(<LanguagePicker {...defaultProps} label="Primary language" />)

        expect(screen.getByText('Primary language')).toBeInTheDocument()
    })

    it('should render helper text', () => {
        render(<LanguagePicker {...defaultProps} />)

        expect(
            screen.getByText(
                'Select the main language for your chat. Add more languages as needed.',
            ),
        ).toBeInTheDocument()
    })

    it('should show Add language button when multi-language is enabled', () => {
        render(<LanguagePicker {...defaultProps} isMultiLanguageEnabled />)

        expect(screen.getByText('Add language')).toBeInTheDocument()
    })

    it('should not show Add language button when multi-language is disabled', () => {
        render(
            <LanguagePicker {...defaultProps} isMultiLanguageEnabled={false} />,
        )

        expect(screen.queryByText('Add language')).not.toBeInTheDocument()
    })

    it('should display selected languages as tags', () => {
        const languagesWithExtra: Language[] = [
            { value: 'en-US', label: 'English (US)', isDefault: true },
            { value: 'fr-FR', label: 'French' },
            { value: 'de-DE', label: 'German' },
        ]

        render(
            <LanguagePicker
                {...defaultProps}
                languages={languagesWithExtra}
                isMultiLanguageEnabled
            />,
        )

        expect(screen.getAllByText('French').length).toBeGreaterThan(0)
        expect(screen.getAllByText('German').length).toBeGreaterThan(0)
    })

    it('should default to English (US) when no default language is provided', () => {
        render(<LanguagePicker {...defaultProps} languages={[]} />)

        expect(screen.getAllByText('English (US)').length).toBeGreaterThan(0)
    })

    it('should fallback to first available language when English (US) is not available', () => {
        const availableWithoutEnglish: Language[] = [
            { value: 'fr-FR', label: 'French' },
            { value: 'de-DE', label: 'German' },
        ]

        render(
            <LanguagePicker
                {...defaultProps}
                languages={[]}
                availableLanguages={availableWithoutEnglish}
            />,
        )

        expect(screen.getAllByText('French').length).toBeGreaterThan(0)
    })

    describe('Interactions', () => {
        it('should call onSelectLanguageChange when a language is added', async () => {
            const user = userEvent.setup()
            const onSelectLanguageChange = jest.fn()

            render(
                <LanguagePicker
                    {...defaultProps}
                    onSelectLanguageChange={onSelectLanguageChange}
                    isMultiLanguageEnabled
                />,
            )

            const addButton = screen.getByRole('button', {
                name: /Add language/i,
            })
            await act(() => user.click(addButton))

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })

            const frenchOption = screen.getByRole('option', { name: /French/i })
            await act(() => user.click(frenchOption))

            expect(onSelectLanguageChange).toHaveBeenCalledWith([
                {
                    id: 'en-US',
                    value: 'en-US',
                    label: 'English (US)',
                    isDefault: true,
                },
                { id: 'fr-FR', value: 'fr-FR', label: 'French' },
            ])
        })

        it('should not show already selected languages in the add dropdown', async () => {
            const user = userEvent.setup()
            const languagesWithSelected: Language[] = [
                {
                    id: 'en-US',
                    value: 'en-US',
                    label: 'English (US)',
                    isDefault: true,
                },
                { id: 'fr-FR', value: 'fr-FR', label: 'French' },
            ]

            render(
                <LanguagePicker
                    {...defaultProps}
                    languages={languagesWithSelected}
                    isMultiLanguageEnabled
                />,
            )

            const addButton = screen.getByRole('button', {
                name: /Add language/i,
            })
            await act(() => user.click(addButton))

            await waitFor(() => {
                expect(screen.getByRole('listbox')).toBeInTheDocument()
            })

            const listbox = screen.getByRole('listbox')
            expect(
                within(listbox).queryByRole('option', { name: /English/i }),
            ).not.toBeInTheDocument()
            expect(
                within(listbox).queryByRole('option', { name: /French/i }),
            ).not.toBeInTheDocument()
            expect(
                within(listbox).getByRole('option', { name: /German/i }),
            ).toBeInTheDocument()
        })

        it('should call onSelectLanguageChange when a language tag is removed', async () => {
            const user = userEvent.setup()
            const onSelectLanguageChange = jest.fn()
            const languagesWithSelected: Language[] = [
                { value: 'en-US', label: 'English (US)', isDefault: true },
                { value: 'fr-FR', label: 'French' },
                { value: 'de-DE', label: 'German' },
            ]

            render(
                <LanguagePicker
                    {...defaultProps}
                    languages={languagesWithSelected}
                    onSelectLanguageChange={onSelectLanguageChange}
                    isMultiLanguageEnabled
                />,
            )

            const closeButtons = screen.getAllByRole('button', {
                name: /close/i,
            })
            await act(() => user.click(closeButtons[0]))

            expect(onSelectLanguageChange).toHaveBeenCalledWith([
                {
                    id: 'en-US',
                    value: 'en-US',
                    label: 'English (US)',
                    isDefault: true,
                },
                { id: 'de-DE', value: 'de-DE', label: 'German' },
            ])
        })

        it('should not show Add language button when all languages are selected', () => {
            const allLanguagesSelected: Language[] = [
                { value: 'en-US', label: 'English (US)', isDefault: true },
                { value: 'fr-FR', label: 'French' },
                { value: 'de-DE', label: 'German' },
                { value: 'es-ES', label: 'Spanish' },
            ]

            render(
                <LanguagePicker
                    {...defaultProps}
                    languages={allLanguagesSelected}
                    isMultiLanguageEnabled
                />,
            )

            expect(
                screen.queryByRole('button', { name: /Add language/i }),
            ).not.toBeInTheDocument()
        })
    })
})

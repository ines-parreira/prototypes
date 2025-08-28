import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import LanguageDropdown from '../LanguageDropdown'

describe('LanguageDropdown', () => {
    const mockOnClose = jest.fn()
    const mockOnSearchChange = jest.fn()
    const mockOnLanguageSelect = jest.fn()
    const mockButtonRef = { current: document.createElement('button') }

    const defaultProps = {
        isOpen: true,
        searchTerm: '',
        filteredLanguages: [
            { code: 'en', name: 'English' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' },
        ],
        buttonRef: mockButtonRef,
        onClose: mockOnClose,
        onSearchChange: mockOnSearchChange,
        onLanguageSelect: mockOnLanguageSelect,
    }

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders dropdown with languages when open', () => {
        render(<LanguageDropdown {...defaultProps} />)

        expect(screen.getByText('Translate to')).toBeInTheDocument()
        expect(screen.getByText('English')).toBeInTheDocument()
        expect(screen.getByText('French')).toBeInTheDocument()
        expect(screen.getByText('German')).toBeInTheDocument()
    })

    it('renders search input', () => {
        render(<LanguageDropdown {...defaultProps} />)

        expect(screen.getByPlaceholderText('Search')).toBeInTheDocument()
    })

    it('calls onLanguageSelect when language is clicked', async () => {
        render(<LanguageDropdown {...defaultProps} />)

        await act(async () => {
            await userEvent.click(screen.getByText('French'))
        })

        expect(mockOnLanguageSelect).toHaveBeenCalledWith('fr')
        expect(mockOnClose).toHaveBeenCalled()
    })

    it('updates search term when typing', async () => {
        render(<LanguageDropdown {...defaultProps} />)

        const searchInput = screen.getByPlaceholderText('Search')
        await act(async () => {
            await userEvent.type(searchInput, 'eng')
        })

        expect(mockOnSearchChange).toHaveBeenCalledTimes(3)
    })
})

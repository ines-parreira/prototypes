import { ReactNode } from 'react'

import { fireEvent, render } from '@testing-library/react'
import { EditorState } from 'draft-js'

import { useLanguageDropdown } from '../hooks/useLanguageDropdown'
import { useOutboundTranslation } from '../hooks/useOutboundTranslation'
import Translate from '../Translate'

jest.mock('../hooks/useOutboundTranslation')
const mockUseOutboundTranslation = useOutboundTranslation as jest.Mock

jest.mock('../hooks/useLanguageDropdown')
const mockUseLanguageDropdown = useLanguageDropdown as jest.Mock

jest.mock('../LanguageDropdown', () => () => <div>LanguageDropdown</div>)

jest.mock(
    'pages/common/draftjs/plugins/toolbar/components/ButtonPopover',
    () =>
        ({ button }: { button: ReactNode }) => <div>{button}</div>,
)

jest.mock('pages/common/components/Loader/Loader', () => () => (
    <div>Loader</div>
))

const mockGetEditorState = jest.fn(() => EditorState.createEmpty())
const mockSetEditorState = jest.fn()

describe('Translate', () => {
    const mockRequestTranslation = jest.fn()
    const mockToggleOriginal = jest.fn()
    const mockToggleDropdown = jest.fn()
    const mockCloseDropdown = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()

        mockUseOutboundTranslation.mockReturnValue({
            isTranslating: false,
            hasTranslation: false,
            requestTranslation: mockRequestTranslation,
            toggleOriginal: mockToggleOriginal,
        })

        mockUseLanguageDropdown.mockReturnValue({
            isOpen: false,
            searchTerm: '',
            filteredLanguages: [],
            toggleDropdown: mockToggleDropdown,
            closeDropdown: mockCloseDropdown,
            setSearchTerm: jest.fn(),
            handleLanguageSelect: jest.fn(),
        })
    })

    it('renders translate button', () => {
        const { getByText } = render(
            <Translate
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(getByText('translate')).toBeInTheDocument()
    })

    it('shows loader when translating', () => {
        const {
            useOutboundTranslation,
        } = require('../hooks/useOutboundTranslation')
        useOutboundTranslation.mockReturnValue({
            isTranslating: true,
            hasTranslation: false,
            requestTranslation: mockRequestTranslation,
            toggleOriginal: mockToggleOriginal,
        })

        const { getByText } = render(
            <Translate
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        expect(getByText('Loader')).toBeInTheDocument()
    })

    it('should toggle dropdown when clicked', () => {
        const { getByText } = render(
            <Translate
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        const button = getByText('translate')
        fireEvent.click(button)

        expect(mockToggleDropdown).toHaveBeenCalled()
    })

    it('toggles original when clicked with active translation', () => {
        mockUseOutboundTranslation.mockReturnValue({
            isTranslating: false,
            hasTranslation: true,
            requestTranslation: mockRequestTranslation,
            toggleOriginal: mockToggleOriginal,
        })

        const { getByText } = render(
            <Translate
                getEditorState={mockGetEditorState}
                setEditorState={mockSetEditorState}
            />,
        )

        const button = getByText('undo')
        fireEvent.click(button)

        expect(mockToggleOriginal).toHaveBeenCalled()
    })
})

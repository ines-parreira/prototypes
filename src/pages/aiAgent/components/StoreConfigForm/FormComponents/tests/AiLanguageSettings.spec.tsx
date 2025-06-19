import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import AiLanguageSettings, {
    AiLanguageSettingsProps,
} from '../AiLanguageSettings'

// Mock MacroEditLanguage component
jest.mock(
    '../../../../../tickets/common/macros/components/MacroEditLanguage',
    () => {
        return function MockMacroEditLanguage({
            language,
            setLanguage,
            hideAutoDetect,
            returnLanguageName,
        }: any) {
            const languageMap: Record<string, string | null> = {
                fr: 'French',
                en: 'English',
                es: 'Spanish',
                '': null,
            }

            return (
                <div>
                    <select
                        data-testid="language-select"
                        value={language || ''}
                        onChange={(e) => {
                            const value = e.target.value
                            if (returnLanguageName) {
                                setLanguage(languageMap[value] || value)
                            } else {
                                setLanguage(value === '' ? null : value)
                            }
                        }}
                    >
                        <option value="">No language</option>
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                    </select>
                    <div
                        data-testid="hide-auto-detect"
                        data-hide-auto-detect={hideAutoDetect}
                    />
                </div>
            )
        }
    },
)

describe('AiLanguageSettings', () => {
    const mockUpdateValue = jest.fn()

    const defaultProps: AiLanguageSettingsProps = {
        aiAgentLanguage: null,
        updateValue: mockUpdateValue,
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders the component with default props', () => {
        render(<AiLanguageSettings {...defaultProps} />)

        expect(screen.getByText('Language')).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent should reply in the same language as the customer',
            ),
        ).toBeInTheDocument()
        expect(
            screen.getByText(
                'AI Agent should only reply in the following language',
            ),
        ).toBeInTheDocument()
    })

    it('shows customers mode as selected when aiAgentLanguage is null', () => {
        render(<AiLanguageSettings {...defaultProps} aiAgentLanguage={null} />)

        const customersRadio = screen.getByDisplayValue('customers')
        const specificRadio = screen.getByDisplayValue('specific')

        expect(customersRadio).toBeChecked()
        expect(specificRadio).not.toBeChecked()
        expect(screen.queryByTestId('language-select')).not.toBeInTheDocument()
    })

    it('shows customers mode as selected when aiAgentLanguage is empty string', () => {
        render(<AiLanguageSettings {...defaultProps} aiAgentLanguage="" />)

        const customersRadio = screen.getByDisplayValue('customers')
        const specificRadio = screen.getByDisplayValue('specific')

        expect(customersRadio).toBeChecked()
        expect(specificRadio).not.toBeChecked()
        expect(screen.queryByTestId('language-select')).not.toBeInTheDocument()
    })

    it('shows specific mode as selected when aiAgentLanguage has a value', () => {
        render(
            <AiLanguageSettings {...defaultProps} aiAgentLanguage="English" />,
        )

        const customersRadio = screen.getByDisplayValue('customers')
        const specificRadio = screen.getByDisplayValue('specific')

        expect(customersRadio).not.toBeChecked()
        expect(specificRadio).toBeChecked()
        expect(screen.getByTestId('language-select')).toBeInTheDocument()
    })

    it('calls updateValue to set aiAgentLanguage to null when switching to customers mode', () => {
        render(
            <AiLanguageSettings {...defaultProps} aiAgentLanguage="English" />,
        )

        const customersRadio = screen.getByDisplayValue('customers')
        fireEvent.click(customersRadio)

        expect(mockUpdateValue).toHaveBeenCalledWith('aiAgentLanguage', null)
        expect(mockUpdateValue).toHaveBeenCalledTimes(1)
    })

    it('sets aiAgentLanguage to English when switching to specific mode', () => {
        render(<AiLanguageSettings {...defaultProps} aiAgentLanguage={null} />)

        const specificRadio = screen.getByDisplayValue('specific')
        fireEvent.click(specificRadio)

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'aiAgentLanguage',
            'English',
        )
        expect(mockUpdateValue).toHaveBeenCalledTimes(1)
    })

    it('shows language dropdown when in specific mode', () => {
        render(<AiLanguageSettings {...defaultProps} aiAgentLanguage="es" />)

        const languageSelect = screen.getByTestId('language-select')
        expect(languageSelect).toBeInTheDocument()
        expect(languageSelect).toHaveValue('es')
    })

    it('calls updateValue when changing specific language', async () => {
        render(
            <AiLanguageSettings {...defaultProps} aiAgentLanguage="English" />,
        )

        const languageSelect = screen.getByTestId('language-select')
        await userEvent.selectOptions(languageSelect, 'fr')

        expect(mockUpdateValue).toHaveBeenCalledWith(
            'aiAgentLanguage',
            'French',
        )
    })

    it('calls updateValue with null when clearing specific language', () => {
        render(
            <AiLanguageSettings {...defaultProps} aiAgentLanguage="English" />,
        )

        const languageSelect = screen.getByTestId('language-select')
        fireEvent.change(languageSelect, { target: { value: '' } })

        expect(mockUpdateValue).toHaveBeenCalledWith('aiAgentLanguage', '')
    })

    it('hides language dropdown when in customers mode', () => {
        render(<AiLanguageSettings {...defaultProps} aiAgentLanguage={null} />)

        expect(screen.queryByTestId('language-select')).not.toBeInTheDocument()
    })

    it('passes hideAutoDetect prop to MacroEditLanguage', () => {
        render(
            <AiLanguageSettings {...defaultProps} aiAgentLanguage="English" />,
        )

        const hideAutoDetectElement = screen.getByTestId('hide-auto-detect')
        expect(hideAutoDetectElement).toHaveAttribute(
            'data-hide-auto-detect',
            'true',
        )
    })
})

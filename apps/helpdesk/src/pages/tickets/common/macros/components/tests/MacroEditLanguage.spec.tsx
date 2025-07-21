import React from 'react'

import { act, fireEvent, render, waitFor } from '@testing-library/react'

import MacroEditLanguage from '../MacroEditLanguage'

// Mock SelectField component
jest.mock('pages/common/forms/SelectField/SelectField', () => {
    return function MockSelectField({
        value,
        onChange,
        options,
        placeholder,
    }: any) {
        return (
            <select
                data-testid="select-field"
                value={value === null ? 'null' : value}
                onChange={(e) => onChange(e.target.value)}
                aria-label={placeholder}
            >
                <option value="null">- No language -</option>
                {options.map((option: any) => (
                    <option key={option.value} value={option.value}>
                        {typeof option.label === 'string'
                            ? option.label
                            : option.value}
                    </option>
                ))}
            </select>
        )
    }
})

// To avoid snapshoting all languages
jest.mock('constants/languages', () => {
    const module: Record<string, unknown> = jest.requireActual(
        'constants/languages',
    )
    return {
        ...module,
        ISO639English: {
            aa: 'Afar',
            ab: 'Abkhazian',
            af: 'Afrikaans',
            en: 'English',
        },
    }
})

jest.mock('models/language/resources', () => ({
    detectLanguage: jest.fn(() => Promise.resolve('af')),
}))

describe('<MacroEditLanguage />', () => {
    it('should render MacroEditLanguage', () => {
        const { container } = render(
            <MacroEditLanguage
                language={'aa'}
                setLanguage={jest.fn()}
                text={'hello world'}
            />,
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should detect language when autodetect', async () => {
        jest.useFakeTimers()
        const setLanguage = jest.fn()
        render(
            <MacroEditLanguage
                language={''}
                setLanguage={setLanguage}
                text={'hello world'}
            />,
        )
        act(() => jest.runAllTimers())
        await waitFor(() => expect(setLanguage).toHaveBeenCalledWith('af'))
    })

    it('should hide auto detect option when hideAutoDetect is true', () => {
        jest.useFakeTimers()
        const { queryByText } = render(
            <MacroEditLanguage
                language={null}
                setLanguage={jest.fn()}
                hideAutoDetect={true}
            />,
        )
        act(() => jest.runAllTimers())
        // Check that Auto detect option is not present in the component
        expect(queryByText(/Auto detect/)).not.toBeInTheDocument()
    })

    it('should show auto detect option when hideAutoDetect is false', () => {
        const { getByTestId } = render(
            <MacroEditLanguage
                language={null}
                setLanguage={jest.fn()}
                hideAutoDetect={false}
            />,
        )

        const select = getByTestId('select-field') as HTMLSelectElement
        const options = Array.from(select.options).map((option) => option.value)
        expect(options).toContain('') // AUTODETECT is an empty string
    })

    it('should show auto detect option when hideAutoDetect is undefined (default behavior)', () => {
        jest.useFakeTimers()
        const setLanguage = jest.fn()
        const { getByTestId } = render(
            <MacroEditLanguage language={null} setLanguage={setLanguage} />,
        )

        act(() => jest.runAllTimers())
        const select = getByTestId('select-field') as HTMLSelectElement
        const options = Array.from(select.options).map((option) => option.value)
        expect(options).toContain('') // AUTODETECT is an empty string
    })

    it('should not run auto detection when hideAutoDetect is true', async () => {
        jest.useFakeTimers()
        const setLanguage = jest.fn()
        render(
            <MacroEditLanguage
                language={''}
                setLanguage={setLanguage}
                text={'hello world'}
                hideAutoDetect={true}
            />,
        )
        act(() => jest.runAllTimers())

        // Should not call setLanguage because auto detection is disabled
        await waitFor(() => expect(setLanguage).not.toHaveBeenCalled())
    })

    it('should return language code when returnLanguageName is false', async () => {
        const setLanguage = jest.fn()
        const { getByTestId } = render(
            <MacroEditLanguage
                language={null}
                setLanguage={setLanguage}
                hideAutoDetect={true}
                returnLanguageName={false}
            />,
        )

        const select = getByTestId('select-field') as HTMLSelectElement
        fireEvent.change(select, { target: { value: 'en' } })
        expect(setLanguage).toHaveBeenCalledWith('en')
    })

    it('should return full language name when returnLanguageName is true', async () => {
        const setLanguage = jest.fn()
        const { getByTestId } = render(
            <MacroEditLanguage
                language={null}
                setLanguage={setLanguage}
                hideAutoDetect={true}
                returnLanguageName={true}
            />,
        )

        const select = getByTestId('select-field') as HTMLSelectElement
        fireEvent.change(select, { target: { value: 'aa' } })

        expect(setLanguage).toHaveBeenCalledWith('Afar')
    })

    it('should handle null value correctly with returnLanguageName', async () => {
        const setLanguage = jest.fn()
        const { getByTestId } = render(
            <MacroEditLanguage
                language={null}
                setLanguage={setLanguage}
                hideAutoDetect={true}
                returnLanguageName={true}
            />,
        )

        const select = getByTestId('select-field') as HTMLSelectElement
        expect(select.value).toBe('null')
        expect(setLanguage).not.toHaveBeenCalled()
    })

    describe('language code/name conversion', () => {
        it('should display correct language when language prop is a code', () => {
            const { getByTestId } = render(
                <MacroEditLanguage
                    language="en"
                    setLanguage={jest.fn()}
                    hideAutoDetect={true}
                />,
            )

            const select = getByTestId('select-field') as HTMLSelectElement
            expect(select.value).toBe('en')
        })

        it('should display correct language when language prop is a name', () => {
            const { getByTestId } = render(
                <MacroEditLanguage
                    language="English"
                    setLanguage={jest.fn()}
                    hideAutoDetect={true}
                />,
            )

            const select = getByTestId('select-field') as HTMLSelectElement
            expect(select.value).toBe('en')
        })

        it('should handle invalid language value', () => {
            const { getByTestId } = render(
                <MacroEditLanguage
                    language="invalid"
                    setLanguage={jest.fn()}
                    hideAutoDetect={true}
                />,
            )

            const select = getByTestId('select-field') as HTMLSelectElement
            expect(select.value).toBe('null')
        })

        it('should handle unknown language code when returnLanguageName is true', () => {
            const setLanguage = jest.fn()
            const { getByTestId } = render(
                <MacroEditLanguage
                    language={null}
                    setLanguage={setLanguage}
                    hideAutoDetect={true}
                    returnLanguageName={true}
                />,
            )

            const select = getByTestId('select-field') as HTMLSelectElement
            fireEvent.change(select, { target: { value: 'unknown' } })
            expect(setLanguage).toHaveBeenCalledWith('')
        })
    })
})

import React from 'react'
import {fireEvent, render, waitFor, within} from '@testing-library/react'
import _noop from 'lodash/noop'
import * as hooks from '../../../hooks'

import {
    FontCatalogueModal,
    getFontsAfterSearch,
    getMultipleFontLink,
} from '../FontCatalogueModal'
import {AGENT_ADDED_FONTS} from '../../../constants'

describe('getMultipleFontLink', () => {
    it('should return link with one font', () => {
        expect(getMultipleFontLink(['Roboto'])).toStrictEqual(
            'https://fonts.googleapis.com/css2?family=Roboto&display=swap'
        )
    })

    it('should return link with multiple fonts', () => {
        expect(
            getMultipleFontLink(['Roboto', 'Verdana', 'Mono'])
        ).toStrictEqual(
            'https://fonts.googleapis.com/css2?family=Roboto&family=Verdana&family=Mono&display=swap'
        )
    })
})

describe('getFontsAfterSearch', () => {
    const fonts = [
        {
            family: 'Roboto',
            category: 'serif',
        },
        {
            family: 'Tata',
            category: 'sans-serif',
        },
        {
            family: 'Jip',
            category: 'handwriting',
        },
        {
            family: 'Paulo',
            category: 'serif',
        },
        {
            family: 'Fig',
            category: 'sans-serif',
        },
        {
            family: 'Glaz',
            category: 'handwriting',
        },
    ]

    it('should not filter if no categories or search', () => {
        expect(
            getFontsAfterSearch({search: '', fonts, categories: []})
        ).toStrictEqual(fonts)
    })

    it('should filter if one category', () => {
        expect(
            getFontsAfterSearch({search: '', fonts, categories: ['serif']})
        ).toStrictEqual([
            {
                family: 'Roboto',
                category: 'serif',
            },
            {
                family: 'Paulo',
                category: 'serif',
            },
        ])
    })

    it('should filter with search ignoring case', () => {
        expect(
            getFontsAfterSearch({search: 'A', fonts, categories: []})
        ).toStrictEqual([
            {
                family: 'Tata',
                category: 'sans-serif',
            },
            {
                family: 'Paulo',
                category: 'serif',
            },
            {
                family: 'Glaz',
                category: 'handwriting',
            },
        ])
    })

    it('should return fonts starting with search first', () => {
        expect(
            getFontsAfterSearch({search: 't', fonts, categories: []})
        ).toStrictEqual([
            {
                family: 'Tata',
                category: 'sans-serif',
            },
            {
                family: 'Roboto',
                category: 'serif',
            },
        ])
    })

    it('should filter if one category and search', () => {
        expect(
            getFontsAfterSearch({search: '', fonts, categories: ['serif']})
        ).toStrictEqual([
            {
                family: 'Roboto',
                category: 'serif',
            },
            {
                family: 'Paulo',
                category: 'serif',
            },
        ])
    })
})

const defaultProps: React.ComponentProps<typeof FontCatalogueModal> = {
    recentlyAddedFonts: [],
    setFontsFromLocalStorage: _noop,
    isModalOpen: false,
    setIsModalOpen: _noop,
}

describe('<FontCatalogueModal />', () => {
    beforeEach(() => {
        // to fully reset the state between tests, clear the storage
        localStorage.clear()
        // and reset all mocks
        jest.clearAllMocks()
    })

    jest.spyOn(hooks, 'useGoogleFonts').mockImplementation(() => ({
        googleFonts: [
            {family: 'Roboto', category: 'serif'},
            {family: 'Adriana', category: 'serif'},
            {family: 'Tambourin', category: 'serif'},
        ],
    }))

    it('should display already added fonts in selected font list', () => {
        const {getByText} = render(
            <FontCatalogueModal
                {...defaultProps}
                isModalOpen
                recentlyAddedFonts={['Roboto', 'Adriana']}
            />
        )

        const selectedFontsContainer = (
            getByText('Selected Fonts').closest('div') as HTMLElement
        ).parentNode as HTMLElement

        within(selectedFontsContainer).getByText('Roboto')
        within(selectedFontsContainer).getByText('Adriana')
    })

    it('should download google fonts on opening', () => {
        render(<FontCatalogueModal {...defaultProps} isModalOpen />)

        const link = document.querySelector('link') as HTMLLinkElement
        expect(link.href).toStrictEqual(
            'https://fonts.googleapis.com/css2?family=Roboto&family=Adriana&family=Tambourin&display=swap'
        )
    })

    it('should show filtered fonts', async () => {
        const {getByTestId, getByText, queryByText} = render(
            <FontCatalogueModal {...defaultProps} isModalOpen />
        )

        getByText('Roboto')
        getByText('Adriana')
        getByText('Tambourin')

        fireEvent.change(getByTestId('Search'), {
            target: {value: 'a'},
        })

        await waitFor(() => expect(queryByText('Roboto')).toBeNull())
        getByText('Adriana')
        getByText('Tambourin')
    })

    it('should select font on click from the list, and remove it with another click', async () => {
        const {getByText} = render(
            <FontCatalogueModal {...defaultProps} isModalOpen />
        )

        const selectedFontsContainer = (
            getByText('Selected Fonts').closest('div') as HTMLElement
        ).parentNode as HTMLElement

        const fontInFontList = getByText('Roboto')

        fireEvent.click(fontInFontList)
        await waitFor(() => within(selectedFontsContainer).getByText('Roboto'))

        fireEvent.click(fontInFontList)
        await waitFor(() =>
            expect(
                within(selectedFontsContainer).queryByText('Roboto')
            ).toBeNull()
        )
    })

    it('should select font on click from the list, and remove it with a click from selected font list', async () => {
        const {getByText} = render(
            <FontCatalogueModal {...defaultProps} isModalOpen />
        )

        const selectedFontsContainer = (
            getByText('Selected Fonts').closest('div') as HTMLElement
        ).parentNode as HTMLElement

        const fontInFontList = getByText('Roboto')

        fireEvent.click(fontInFontList)

        const fontInSelectedList = within(selectedFontsContainer)
            .getByText('Roboto')
            .closest('div') as HTMLDivElement

        fireEvent.click(within(fontInSelectedList).getByText('close'))
        await waitFor(() =>
            expect(
                within(selectedFontsContainer).queryByText('Roboto')
            ).toBeNull()
        )
    })

    it('should save selected fonts in local storage, sorted in alphabetical order', () => {
        const setItem = jest.spyOn(window.localStorage.__proto__, 'setItem')

        const {getByText} = render(
            <FontCatalogueModal {...defaultProps} isModalOpen />
        )

        fireEvent.click(getByText('Roboto'))
        fireEvent.click(getByText('Adriana'))
        fireEvent.click(getByText('Save Selected Fonts'))

        expect(setItem).toHaveBeenCalledWith(
            AGENT_ADDED_FONTS,
            '["Adriana","Roboto"]'
        )
    })

    it('should disable save button if no changes have been made, and allow to save otherwise', () => {
        const setItem = jest.spyOn(window.localStorage.__proto__, 'setItem')

        const {getByText} = render(
            <FontCatalogueModal {...defaultProps} isModalOpen />
        )

        const submitButton = getByText(
            'Save Selected Fonts'
        ) as HTMLButtonElement
        expect(submitButton.disabled).toBe(true)

        fireEvent.click(getByText('Adriana'))
        expect(submitButton.disabled).toBe(false)

        const selectedFontsContainer = (
            getByText('Selected Fonts').closest('div') as HTMLElement
        ).parentNode as HTMLElement
        const fontInSelectedList = within(selectedFontsContainer)
            .getByText('Adriana')
            .closest('div') as HTMLDivElement

        fireEvent.click(within(fontInSelectedList).getByText('close'))
        expect(submitButton.disabled).toBe(true)

        fireEvent.click(getByText('Adriana'))
        fireEvent.click(submitButton)

        expect(setItem).toHaveBeenCalledWith(AGENT_ADDED_FONTS, '["Adriana"]')
    })
})

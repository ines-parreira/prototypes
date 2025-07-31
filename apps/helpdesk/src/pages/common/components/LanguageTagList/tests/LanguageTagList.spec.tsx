import React from 'react'

import { userEvent } from '@repo/testing'
import { render, screen, waitFor } from '@testing-library/react'

import { Locale, LocaleCode } from 'models/helpCenter/types'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import { LanguageTagList } from '../LanguageTagList'

const DEFAULT_SUFFIX = '(Default)'
const LOCALE = {
    name: 'English - USA',
    code: 'en-US' as LocaleCode,
    created_datetime: '2021-05-17T18:20:50.067Z',
    updated_datetime: '2021-05-17T18:20:50.067Z',
    deleted_datetime: null,
}

/**
 * IMPORTANT: Keep in mind the content of this list is rendered in reverse
 */
describe('<LanguageTagList />', () => {
    it('renders nothing if list is empty', () => {
        const { container } = render(
            <LanguageTagList
                id="1"
                defaultLanguage={LOCALE}
                languageList={[]}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders nothing if defaultLanguage is missing', () => {
        const { container } = render(
            <LanguageTagList
                id="1"
                defaultLanguage={undefined as unknown as Locale}
                languageList={[]}
            />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders the default language with (Default) suffix if there are many languages', () => {
        render(
            <LanguageTagList
                id="1"
                defaultLanguage={LOCALE}
                languageList={[...getLocalesResponseFixture, LOCALE]}
            />,
        )

        expect(
            screen.getByText(`${LOCALE.name} ${DEFAULT_SUFFIX}`),
        ).toBeInTheDocument()
    })

    it('renders the default language with (Default) suffix if there are only one language', () => {
        render(
            <LanguageTagList
                id="1"
                defaultLanguage={LOCALE}
                languageList={[LOCALE]}
            />,
        )

        expect(
            screen.getByText(`${LOCALE.name} ${DEFAULT_SUFFIX}`),
        ).toBeInTheDocument()
    })

    describe('when locales are within display limit', () => {
        const fewerLocales = getLocalesResponseFixture.slice(0, 2)
        const displayLimit = 2

        it('displays all languages in correct order', () => {
            render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={fewerLocales}
                    displayLimit={displayLimit}
                />,
            )

            const reversedLocales = [...fewerLocales].reverse()
            reversedLocales.forEach((locale) => {
                const expectedText =
                    locale.code === LOCALE.code
                        ? `${locale.name} ${DEFAULT_SUFFIX}`
                        : locale.name
                expect(screen.getByText(expectedText)).toBeInTheDocument()
            })
        })

        it('does not show more indicator', () => {
            render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={fewerLocales}
                    displayLimit={displayLimit}
                />,
            )

            expect(screen.queryByText(/\+\d+ more/)).not.toBeInTheDocument()
        })
    })

    describe('when locales exceed display limit', () => {
        const allLocales = getLocalesResponseFixture
        const displayLimit = 2

        it('shows correct more indicator with count', () => {
            render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={allLocales}
                    displayLimit={displayLimit}
                />,
            )

            const hiddenCount = allLocales.length - displayLimit
            const moreText = `+${hiddenCount} more`
            const moreTag = screen.getByText(moreText)

            expect(moreTag).toBeInTheDocument()
        })

        it('displays correct number of tags', () => {
            const { container } = render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={allLocales}
                    displayLimit={displayLimit}
                />,
            )

            const displayedTags = container.querySelectorAll(
                '[data-testid^="displayed-tag-"]',
            )

            const hiddenTags = container.querySelectorAll('[id^=badge-]')

            expect(displayedTags.length + hiddenTags.length).toBe(
                displayLimit + 1,
            ) // displayLimit + +N tag
        })

        it('shows correct languages in displayed tags', () => {
            const DEFAULT_LANGUAGE =
                getLocalesResponseFixture[getLocalesResponseFixture.length - 1]
            render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={DEFAULT_LANGUAGE}
                    languageList={allLocales}
                    displayLimit={displayLimit}
                />,
            )

            const localesWithDefaultAtBack = [...allLocales]

            const displayedLanguages = localesWithDefaultAtBack.slice(
                -1 * displayLimit,
            )

            displayedLanguages.reverse().forEach((locale) => {
                const expectedText =
                    locale.code === DEFAULT_LANGUAGE.code
                        ? `${locale.name} ${DEFAULT_SUFFIX}`
                        : locale.name
                expect(screen.getByText(expectedText)).toBeInTheDocument()
            })
        })

        it('formats tooltip text correctly', async () => {
            render(
                <LanguageTagList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={allLocales}
                    displayLimit={displayLimit}
                />,
            )

            const localesWithDefaultAtBack = [...allLocales]
            const defaultIndex = localesWithDefaultAtBack.findIndex(
                (locale) => locale.code === LOCALE.code,
            )
            if (defaultIndex !== -1) {
                const [defaultLocale] = localesWithDefaultAtBack.splice(
                    defaultIndex,
                    1,
                )
                localesWithDefaultAtBack.push(defaultLocale)
            }

            const hiddenLanguages = localesWithDefaultAtBack.slice(
                0,
                -1 * displayLimit,
            )

            const moreLangsTag = screen.getByText(
                `+${hiddenLanguages.length} more`,
            )

            userEvent.hover(moreLangsTag)

            // Verify the tooltip languages appear in the correct container
            await waitFor(() => {
                // Verify tooltip becomes visible and contains correct languages
                const tooltipContainer = screen.getByTestId(
                    'language-tag-tooltip',
                )
                expect(tooltipContainer).toBeVisible()

                hiddenLanguages.forEach((locale) => {
                    expect(tooltipContainer).toContainElement(
                        screen.getByText(locale.name),
                    )
                })
            })
        })
    })
})

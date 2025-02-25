import React from 'react'

import { render, screen } from '@testing-library/react'

import { LocaleCode } from 'models/helpCenter/types'
import { getLocalesResponseFixture } from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import { LanguageList } from '../LanguageList'

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
describe('<LanguageList />', () => {
    it('renders nothing if list is empty or defaultLocale is missing', () => {
        const { container } = render(
            <LanguageList id="1" defaultLanguage={LOCALE} languageList={[]} />,
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders the default language last', () => {
        render(
            <LanguageList
                id="1"
                defaultLanguage={LOCALE}
                languageList={getLocalesResponseFixture}
            />,
        )

        const bullets = screen.getAllByLabelText(/Item for locale */).reverse()
        expect(bullets[0]).toHaveAccessibleName('Item for locale en-US')
    })

    describe('when we have equal or less locales than limit', () => {
        it('renders all the locales', () => {
            const fewerLocales = getLocalesResponseFixture.slice(0, 2)
            render(
                <LanguageList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={fewerLocales}
                />,
            )
            const bullets = screen
                .getAllByLabelText(/Item for locale */)
                .reverse()
            bullets.forEach((locale, index) => {
                expect(locale).toHaveAccessibleName(
                    `Item for locale ${fewerLocales[index].code}`,
                )
            })
        })
    })

    describe('when we have more locales than the limit', () => {
        it('limits the bullets and shows the overflow', () => {
            render(
                <LanguageList
                    id="1"
                    defaultLanguage={LOCALE}
                    languageList={getLocalesResponseFixture}
                />,
            )
            screen.getByLabelText('Item for locale overflow')
        })
    })
})

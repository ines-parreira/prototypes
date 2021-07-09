import React from 'react'
import {render} from '@testing-library/react'

import {
    LocaleCode,
    HelpCenterLocale,
} from '../../../../../models/helpCenter/types'
import {getLocalesResponseFixture as LOCALE_LIST} from '../../../../settings/helpCenter/fixtures/getLocalesResponse.fixtures'

import {LanguageList} from '../LanguageList'

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
        const {container} = render(
            <LanguageList
                helpcenterId="1"
                defaultLanguage={LOCALE}
                languageList={[]}
            />
        )
        expect(container.firstChild).toBeNull()
    })

    it('renders the default language last', () => {
        const {getAllByTestId} = render(
            <LanguageList
                helpcenterId="1"
                defaultLanguage={LOCALE}
                languageList={LOCALE_LIST as HelpCenterLocale[]}
            />
        )

        const bullets = getAllByTestId(/locale-bullet-*/).reverse()
        expect(bullets[0].dataset.testid).toEqual('locale-bullet-en-US')
    })

    describe('when we have equal or less locales than limit', () => {
        it('renders all the locales', () => {
            const fewerLocales = LOCALE_LIST.slice(0, 2) as HelpCenterLocale[]
            const {getAllByTestId} = render(
                <LanguageList
                    helpcenterId="1"
                    defaultLanguage={LOCALE}
                    languageList={fewerLocales}
                />
            )
            const bullets = getAllByTestId(/locale-bullet-*/).reverse()
            bullets.forEach((locale, index) => {
                expect(locale.dataset.testid).toEqual(
                    `locale-bullet-${fewerLocales[index].code}`
                )
            })
        })
    })

    describe('when we have more locales than the limit', () => {
        it('limits the bullets and shows the overflow', () => {
            const {getByTestId} = render(
                <LanguageList
                    helpcenterId="1"
                    defaultLanguage={LOCALE}
                    languageList={LOCALE_LIST as HelpCenterLocale[]}
                />
            )
            getByTestId('locale-bullet-overflow')
        })
    })
})

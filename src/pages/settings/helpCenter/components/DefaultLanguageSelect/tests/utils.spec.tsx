import React from 'react'

import {HelpCenterLocale} from '../../../../../../models/helpCenter/types'

import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'

import {generateLocaleOptions} from '../utils'

const availableLanguages = ['en-US', 'fr-FR', 'de-DE']

describe('generateLocaleOptions()', () => {
    it('returns only the available languages', () => {
        const output = generateLocaleOptions(
            getLocalesResponseFixture as HelpCenterLocale[],
            availableLanguages
        )

        expect(
            output.every((locale) => availableLanguages.includes(locale.value))
        )
    })

    it('creates a React element as label', () => {
        const output = generateLocaleOptions(
            getLocalesResponseFixture as HelpCenterLocale[],
            availableLanguages
        )
        expect(output.every((locale) => React.isValidElement(locale.label)))
    })
})

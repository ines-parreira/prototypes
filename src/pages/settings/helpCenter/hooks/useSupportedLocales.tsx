import React from 'react'
import keyBy from 'lodash/keyBy'

import {HelpCenterLocale} from '../../../../models/helpCenter/types'

import {getLocalesResponseFixture} from '../fixtures/getLocalesResponse.fixtures'

// TODO: Probably move this to models?
export type LocalesByKey = {
    [key: string]: HelpCenterLocale
}

// TODO: connect this to redux store where we will store the locales
export const useSupportedLocales = (): LocalesByKey => {
    const localesByCode = React.useMemo(
        () => keyBy(getLocalesResponseFixture, 'code'),
        [getLocalesResponseFixture]
    )

    return localesByCode
}

import { CountryCode } from 'libphonenumber-js'

import { getCountryCallingCodeFixed } from 'pages/settings/helpCenter/utils/phoneCodeSelectOptions'

describe('getCountryCallingCodeFixed', () => {
    it.each([
        { countryCode: 'AQ' as CountryCode, countryCallingCode: '672' },
        { countryCode: 'PN' as CountryCode, countryCallingCode: '64' },
        { countryCode: 'BV' as CountryCode, countryCallingCode: '47' },
        { countryCode: 'TF' as CountryCode, countryCallingCode: '262' },
        { countryCode: 'HM' as CountryCode, countryCallingCode: '672' },
        { countryCode: 'GS' as CountryCode, countryCallingCode: '500' },
        { countryCode: 'UM' as CountryCode, countryCallingCode: '1' },
        { countryCode: 'US' as CountryCode, countryCallingCode: '1' },
    ])(
        'should return code %s for country %s ',
        ({ countryCode, countryCallingCode }) => {
            expect(getCountryCallingCodeFixed(countryCode)).toEqual(
                countryCallingCode,
            )
        },
    )
})

import React from 'react'
import {shallow} from 'enzyme'

import {
    LocaleCode,
    HelpCenterLocale,
} from '../../../../../../models/helpCenter/types'

import LanguageSelect from '../LanguageSelect'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'

describe('<LanguageSelect/>', () => {
    const mockedOnChange = jest.fn()

    const props = {
        label: 'Language select',
        options: getLocalesResponseFixture as HelpCenterLocale[],
        value: getLocalesResponseFixture[0].code as LocaleCode,
        onChange: mockedOnChange,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the component correctly', () => {
        const component = shallow(<LanguageSelect {...props} />)
        expect(component).toMatchSnapshot()
    })
})

import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {getSingleHelpCenterResponseFixture} from '../../../fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from '../../../fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from '../../../providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from '../../../utils/helpCenter.utils'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'

const windowOpenMock = jest.fn().mockReturnValue({
    focus: jest.fn(),
})

global.open = windowOpenMock

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const viewLanguage = 'en-US'
const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getSingleHelpCenterResponseFixture,
        },
    } as any,
    helpCenter: {
        ui: {currentId: 1, currentLanguage: viewLanguage},
        articles: {articlesById: {}},
        categories: {categoriesById: {}},
    },
}

const store = mockStore(defaultState)

jest.mock('../../../providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<HelpCenterPageWrapper />', () => {
    const props: ComponentProps<typeof HelpCenterPageWrapper> = {
        helpCenter: getSingleHelpCenterResponseFixture,
        activeLabel: 'Articles',
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = render(
            <Provider store={store}>
                <HelpCenterPageWrapper {...props} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should display a preview button', () => {
        const {getByRole} = render(
            <Provider store={store}>
                <HelpCenterPageWrapper {...props} />
            </Provider>
        )

        const previewBtn = getByRole('button', {name: /help center preview/i})
        fireEvent.click(previewBtn)

        const domain = getHelpCenterDomain(getSingleHelpCenterResponseFixture)
        const helpCenterUrl = getAbsoluteUrl({domain, locale: viewLanguage})

        expect(windowOpenMock).toHaveBeenCalledWith(helpCenterUrl, '_blank')
    })

    it('should display a language selector', () => {
        const {getByRole} = render(
            <Provider store={store}>
                <HelpCenterPageWrapper {...props} showLanguageSelector />
            </Provider>
        )

        const languageSelector = getByRole('textbox')

        expect(languageSelector).toBeTruthy()
    })
})

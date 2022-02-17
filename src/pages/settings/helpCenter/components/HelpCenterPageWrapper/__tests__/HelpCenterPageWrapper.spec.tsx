import React, {ComponentProps} from 'react'
import {fireEvent, render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {RootState, StoreDispatch} from 'state/types'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'

const windowOpenMock = jest.fn().mockReturnValue({
    focus: jest.fn(),
})

global.open = windowOpenMock

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

const viewLanguage = 'en-US'
const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: {articlesById: {}},
            categories: {categoriesById: {}},
        },
    } as any,
    ui: {helpCenter: {currentId: 1, currentLanguage: viewLanguage}} as any,
}

const store = mockStore(defaultState)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<HelpCenterPageWrapper />', () => {
    const props: ComponentProps<typeof HelpCenterPageWrapper> = {
        helpCenter: getSingleHelpCenterResponseFixture,
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

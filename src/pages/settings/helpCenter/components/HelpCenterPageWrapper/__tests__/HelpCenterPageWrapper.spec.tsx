import React, {ComponentProps} from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {RootState, StoreDispatch} from 'state/types'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {
    getAbsoluteUrl,
    getHelpCenterDomain,
} from 'pages/settings/helpCenter/utils/helpCenter.utils'
import {renderWithRouter} from 'utils/testing'
import {billingState} from 'fixtures/billing'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import HelpCenterPageWrapper from '../HelpCenterPageWrapper'

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/utils/localeSelectOptions', () => {
    const dep: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/utils/localeSelectOptions'
    )
    return {
        ...dep,
        getLocaleSelectOptions: () => [
            {
                label: 'English',
                value: 'en-US',
            },
            {
                label: 'Spanish',
                value: 'es-ES',
            },
        ],
    }
})
jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    const dep: Record<string, unknown> = jest.requireActual(
        'pages/settings/helpCenter/hooks/useHelpCenterApi'
    )
    return {
        ...dep,
        useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
    }
})

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
    billing: fromJS(billingState),
}

const store = mockStore(defaultState)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<HelpCenterPageWrapper />', () => {
    const props: ComponentProps<typeof HelpCenterPageWrapper> = {
        helpCenter: getSingleHelpCenterResponseFixture,
    }

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={store}>
                <HelpCenterPageWrapper {...props} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should display a preview button', () => {
        const {getByRole} = renderWithRouter(
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
        const {getByRole} = renderWithRouter(
            <Provider store={store}>
                <HelpCenterPageWrapper {...props} showLanguageSelector />
            </Provider>
        )

        getByRole('textbox')
    })

    it('should display the close modal', () => {
        const onSaveChanges = jest.fn(() => Promise.resolve())
        renderWithRouter(
            <Provider store={store}>
                <HelpCenterPageWrapper
                    {...props}
                    isDirty={true}
                    showLanguageSelector
                    onSaveChanges={onSaveChanges}
                />
            </Provider>
        )

        const englishBtn = screen.getByText(/english/i)
        fireEvent.click(englishBtn)

        const spanishBtn = screen.getByText(/spanish/i)
        fireEvent.click(spanishBtn)

        screen.getByText(/discard changes/i)
    })

    it('should trigger the onSave callback', () => {
        const onSave = jest.fn(() => Promise.resolve())
        renderWithRouter(
            <Provider store={store}>
                <HelpCenterPageWrapper
                    {...props}
                    onSaveChanges={onSave}
                    showLanguageSelector
                    isDirty={true}
                />
            </Provider>
        )

        const englishBtn = screen.getByText(/english/i)
        fireEvent.click(englishBtn)

        const spanishBtn = screen.getByText(/spanish/i)
        fireEvent.click(spanishBtn)

        const saveBtn = screen.getByRole('button', {name: /save/i})

        fireEvent.click(saveBtn)

        expect(onSave).toHaveBeenCalled()
    })
})

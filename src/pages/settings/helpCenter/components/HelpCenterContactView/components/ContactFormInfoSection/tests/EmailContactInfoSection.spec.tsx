import React, {FC} from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {mockFlags, resetLDMocks} from 'jest-launchdarkly-mock'
import {screen} from '@testing-library/react'

import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {FeatureFlagKey} from 'config/featureFlags'
import ContactFormInfoSection from '../ContactFormInfoSection'
import {getSingleHelpCenterResponseFixture} from '../../../../../fixtures/getHelpCentersResponse.fixture'
import {getHelpCenterTranslationsResponseFixture} from '../../../../../fixtures/getHelpCenterTranslationsResponse.fixture'
import {getLocalesResponseFixture} from '../../../../../fixtures/getLocalesResponse.fixtures'
import {useCurrentHelpCenter} from '../../../../../providers/CurrentHelpCenter'
import {HelpCenterTranslationProvider} from '../../../../../providers/HelpCenterTranslation'
import {useSupportedLocales} from '../../../../../providers/SupportedLocales'
const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    integrations: fromJS({
        integrations: [],
    }),
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}

const mockedUpdateHelpCenter = jest
    .fn()
    .mockResolvedValue({data: getSingleHelpCenterResponseFixture})

const mockedGetHelpCenter = jest
    .fn()
    .mockResolvedValue({data: getSingleHelpCenterResponseFixture})

const mockedUpdateHelpCenterTranslation = jest.fn()
const mockedListHelpCenterTranslations = jest
    .fn()
    .mockResolvedValue(getHelpCenterTranslationsResponseFixture)
const mockedListGoogleFonts = jest.fn().mockResolvedValue({
    data: [
        {family: 'Roboto', category: 'serif'},
        {family: 'Adriana', category: 'serif'},
        {family: 'Tambourin', category: 'serif'},
    ],
})

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter,
                updateHelpCenterTranslation: mockedUpdateHelpCenterTranslation,
                listHelpCenterTranslations: mockedListHelpCenterTranslations,
                getHelpCenter: mockedGetHelpCenter,
                listGoogleFonts: mockedListGoogleFonts,
            },
        }),
    }
})

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

const DefaultProviders: FC = ({children}) => (
    <Provider store={mockedStore(defaultState)}>
        <HelpCenterTranslationProvider
            helpCenter={getSingleHelpCenterResponseFixture}
        >
            {children}
        </HelpCenterTranslationProvider>
    </Provider>
)

describe('<ContactFormInfoSection />', () => {
    beforeEach(() => {
        resetLDMocks()
        mockFlags({
            [FeatureFlagKey.HelpCenterEmbeddedContactForm]: false,
        })
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <DefaultProviders>
                <ContactFormInfoSection
                    helpCenter={getSingleHelpCenterResponseFixture}
                />
            </DefaultProviders>
        )

        expect(screen.getAllByText('Embed contact form').length).toBe(1)
        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render the component with the embedded contact form', () => {
        mockFlags({
            [FeatureFlagKey.HelpCenterEmbeddedContactForm]: true,
        })

        renderWithRouter(
            <DefaultProviders>
                <ContactFormInfoSection
                    helpCenter={getSingleHelpCenterResponseFixture}
                />
            </DefaultProviders>
        )

        expect(screen.getAllByText('Embed contact form').length).toBe(2)
    })
})

import React, {FC} from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import _keyBy from 'lodash/keyBy'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'
import PhoneContactInfoSection from '../PhoneContactInfoSection'
import {getSingleHelpCenterResponseFixture} from '../../../../../fixtures/getHelpCentersResponse.fixture'
import {HelpCenterTranslationProvider} from '../../../../../providers/HelpCenterTranslation'
import {RootState, StoreDispatch} from '../../../../../../../../state/types'
import {useCurrentHelpCenter} from '../../../../../providers/CurrentHelpCenter'
import {getHelpCenterTranslationsResponseFixture} from '../../../../../fixtures/getHelpCenterTranslationsResponse.fixture'
import {useSupportedLocales} from '../../../../../providers/SupportedLocales'
import {getLocalesResponseFixture} from '../../../../../fixtures/getLocalesResponse.fixtures'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: _keyBy([ContactFormFixture], 'id'),
            },
        },
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

jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            getContactFormById: jest.fn(),
        }),
    }
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
describe('<PhoneContactInfoSection />', () => {
    it('should render the component', () => {
        const {container} = render(<PhoneContactInfoSection />, {
            wrapper: DefaultProviders,
        })

        expect(container.firstChild).toMatchSnapshot()
    })
})

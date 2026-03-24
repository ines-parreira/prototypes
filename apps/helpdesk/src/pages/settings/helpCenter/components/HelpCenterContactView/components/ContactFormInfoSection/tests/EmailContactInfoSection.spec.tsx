import type React from 'react'

import { useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { getContactFormForHelpCenterFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import type { Components } from 'rest_api/help_center_api/client.generated'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'
import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import { getSingleHelpCenterResponseFixtureWithTranslation } from '../../../../../fixtures/getHelpCentersResponse.fixture'
import { HelpCenterTranslationProvider } from '../../../../../providers/HelpCenterTranslation/HelpCenterTranslation'
import ContactFormInfoSection from '../ContactFormInfoSection'

jest.mock('@repo/feature-flags')

const mockUseFlag = useFlag as jest.MockedFunction<typeof useFlag>

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const contactForm = getContactFormForHelpCenterFixture({
    id: 111,
    help_center_id: 333,
})
const helpCenter = {
    ...getSingleHelpCenterResponseFixtureWithTranslation,
    id: 333,
    email_integration: {
        email: 'new-help-center@test.email',
        id: 444,
    },
    translations:
        getSingleHelpCenterResponseFixtureWithTranslation.translations?.map(
            (t) => ({
                ...t,
                help_center_id: 333,
                id: 555,
                contact_form_id: 111,
            }),
        ) as Components.Schemas.GetHelpCenterDto['translations'],
}

const defaultState: Partial<RootState> = {
    entities: {
        contactForm: {
            contactForms: {
                contactFormById: {
                    [contactForm.id]: contactForm,
                },
            },
        },
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    [helpCenter.id]: helpCenter,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    integrations: fromJS({
        integrations: [],
    }),
    ui: { helpCenter: { ...uiState } } as any,
}

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')

const mockedUpdateHelpCenterTranslation = jest.fn()
const mockedUpdateHelpCenter = jest.fn()
const mockedListHelpCenterTranslations = jest.fn()
const mockedGetHelpCenter = jest.fn()
const mockedListGoogleFonts = jest.fn()
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

const mockGetContactFormById = jest.fn()
const mockUpdateContactForm = jest.fn()
jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            getContactFormById: mockGetContactFormById,
            updateContactForm: mockUpdateContactForm,
        }),
    }
})

const DefaultProviders: React.FC<{ children?: React.ReactNode }> = ({
    children,
}) => (
    <Provider store={mockedStore(defaultState)}>
        <HelpCenterTranslationProvider helpCenter={helpCenter}>
            {children}
        </HelpCenterTranslationProvider>
    </Provider>
)

describe('<ContactFormInfoSection />', () => {
    it('should render the component with the subject lines component', () => {
        mockUseFlag.mockReturnValue(true)

        renderWithRouter(
            <DefaultProviders>
                <DndProvider backend={HTML5Backend}>
                    <ContactFormInfoSection />
                </DndProvider>
            </DefaultProviders>,
        )

        expect(screen.getAllByText('Contact form subject').length).toBe(1)
    })
})

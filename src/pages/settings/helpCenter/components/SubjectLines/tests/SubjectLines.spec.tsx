import React, {FC} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {RootState, StoreDispatch} from 'state/types'

import {renderWithRouter} from 'utils/testing'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {HelpCenterTranslationProvider} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import SubjectLines from '../SubjectLines'

jest.mock('lodash/uniqueId', () => (id?: string) => `${id || 'uniqueId'}`)

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)
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
    it('should render the component', () => {
        const {container} = renderWithRouter(
            <DefaultProviders>
                <DndProvider backend={HTML5Backend}>
                    <SubjectLines
                        contactForm={{
                            helpdesk_integration_email: 'irinel@gorgias.com',
                            helpdesk_integration_id: 123,
                            card_enabled: true,
                            subject_lines: {
                                'en-US': {
                                    allow_other: true,
                                    options: [
                                        'Option 1',
                                        'Option 2',
                                        'Option 3',
                                    ],
                                },
                            },
                        }}
                        translationsLoaded={true}
                        helpCenter={getSingleHelpCenterResponseFixture}
                        currentLocale="en-US"
                        updateContactForm={jest.fn}
                    />
                </DndProvider>
            </DefaultProviders>
        )

        expect(container).toMatchSnapshot()
    })
})

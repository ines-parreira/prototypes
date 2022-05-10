import React from 'react'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import {render} from '@testing-library/react'
import {fromJS} from 'immutable'
import {RootState, StoreDispatch} from 'state/types'
import {contactInfoFixture} from 'pages/settings/helpCenter/fixtures/contactInfo.fixture'
import {useHelpCenterTranslation} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import ChatContactInfoSection from '../ChatContactInfoSection'

jest.mock('pages/settings/helpCenter/providers/HelpCenterTranslation')

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
const defaultState: Partial<RootState> = {
    currentAccount: fromJS({
        settings: [
            {
                data: {
                    business_hours: [
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '9:00',
                            to_time: '11:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '14:00',
                            to_time: '16:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '8:00',
                            to_time: '12:00',
                        },
                        {
                            days: '0,1,2,3,4,5,6',
                            from_time: '13:00',
                            to_time: '17:30',
                        },
                    ],
                    timezone: 'US/Pacific',
                },
                id: 2,
                type: 'business-hours',
            },
        ],
    }),
    ui: {
        helpCenter: {
            currentLanguage: 'en-US',
            currentId: 1,
        },
        editor: {
            isEditingLink: false,
        },
        stats: {
            fetchingMap: {},
        },
        ticketNavbar: {
            optimisticAccountSettings: {
                views: {},
                view_sections: {},
            },
            optimisticUserSettings: {
                views: {},
                view_sections: {},
            },
        },
        views: {
            activeViewId: 1,
        },
        selfServiceConfigurations: {
            loading: false,
        },
    },
}

describe('<ChatContactInfoSection />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        ;(useHelpCenterTranslation as jest.Mock).mockReturnValue({
            translation: {
                chatApplicationId: 1,
                contactInfo: contactInfoFixture,
            },
            updateTranslation: jest.fn(),
        })

        const {container} = render(
            <Provider store={mockStore(defaultState)}>
                <ChatContactInfoSection />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

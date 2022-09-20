import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {createBrowserHistory} from 'history'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {HELP_CENTER_BASE_PATH} from 'pages/settings/helpCenter/constants'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import HelpCenterStartView from '../HelpCenterStartView'

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                listArticles: jest.fn().mockResolvedValue({
                    data: {data: [], meta: {item_count: 0}},
                }),
                listArticleTranslations: jest.fn().mockResolvedValue({
                    data: {data: [], meta: {item_count: 0}},
                }),
            },
            agentAbility: [
                {
                    action: 'manage',
                    subject: 'all',
                },
            ],
        }),
        useAbilityChecker: () => ({isPassingRulesCheck: () => true}),
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedHistory = {...createBrowserHistory(), push: jest.fn()}

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
;(useSupportedLocales as jest.Mock).mockReturnValue(getLocalesResponseFixture)

describe('<HelpCenterStartView />', () => {
    const defaultState: Partial<RootState> = {
        entities: {
            helpCenter: {
                helpCenters: {
                    helpCentersById: {
                        '1': getHelpCentersResponseFixture.data[0],
                        '2': getHelpCentersResponseFixture.data[1],
                        '3': getHelpCentersResponseFixture.data[2],
                    },
                },
            },
        } as any,
    }
    const props = {}

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should navigate to the creation page when clicking on the new button', () => {
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>,
            {history: mockedHistory}
        )
        const newBtn = screen.getByText(/add new/i)
        fireEvent.click(newBtn)

        expect(mockedHistory.push).toHaveBeenLastCalledWith(
            `${HELP_CENTER_BASE_PATH}/new`
        )
    })
})

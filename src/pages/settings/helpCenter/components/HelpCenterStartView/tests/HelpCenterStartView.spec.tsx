import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {HELP_CENTER_BASE_PATH} from 'pages/settings/helpCenter/constants'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import HelpCenterStartView from '../HelpCenterStartView'
import {useHelpCenterList} from '../../../hooks/useHelpCenterList'

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

const mockHistoryPush = jest.fn()

jest.mock(
    'react-router-dom',
    () =>
        ({
            ...jest.requireActual('react-router-dom'),
            useHistory: () => ({
                push: mockHistoryPush,
            }),
        } as Record<string, unknown>)
)

jest.mock('pages/settings/helpCenter/providers/SupportedLocales')
const mockedUseSupportedLocales = assumeMock(useSupportedLocales)
mockedUseSupportedLocales.mockReturnValue(getLocalesResponseFixture)

const helpCenters = getHelpCentersResponseFixture.data

jest.mock('../../../hooks/useHelpCenterList')
const mockedUseHelpCenterList = assumeMock(useHelpCenterList)
mockedUseHelpCenterList.mockReturnValue({
    isLoading: false,
    hasMore: false,
    fetchMore: jest.fn(),
    helpCenters: [],
})

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

    it('should render the About component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>,
            {
                route: `${HELP_CENTER_BASE_PATH}`,
            }
        )

        screen.getByText(
            /Set up a free Help Center\/FAQ site and let your customers find answers./i
        )

        expect(container).toMatchSnapshot()
    })

    it('should render the Manage component', () => {
        mockedUseHelpCenterList.mockReturnValue({
            isLoading: false,
            hasMore: false,
            fetchMore: jest.fn(),
            helpCenters,
        })

        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>,
            {
                route: `${HELP_CENTER_BASE_PATH}`,
            }
        )

        screen.getByText(/Help Center Name/i)

        expect(container).toMatchSnapshot()
    })

    it('should navigate to the creation page when clicking on the new button in the Manage tab', () => {
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>,
            {
                route: `${HELP_CENTER_BASE_PATH}/manage`,
            }
        )
        const newBtn = screen.getByText(/create new/i)
        fireEvent.click(newBtn)

        expect(mockHistoryPush).toHaveBeenLastCalledWith(
            `${HELP_CENTER_BASE_PATH}/new`
        )
    })
})

import React from 'react'
import {fireEvent, screen} from '@testing-library/react'
import {createBrowserHistory} from 'history'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from 'state/types'
import {renderWithRouter} from 'utils/testing'
import {getHelpCentersResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {getLocalesResponseFixture} from 'pages/settings/helpCenter/fixtures/getLocalesResponse.fixtures'
import {useSupportedLocales} from 'pages/settings/helpCenter/providers/SupportedLocales'
import {useHelpCenterList} from '../../../hooks/useHelpCenterList'
import ManageHelpCenters, {ManageHelpCentersProps} from '../ManageHelpCenters'

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

const helpCenters = getHelpCentersResponseFixture.data

jest.mock('pages/settings/helpCenter/hooks/useHelpCenterList')
;(useHelpCenterList as jest.Mock).mockReturnValue({
    isLoading: false,
    hasMore: false,
    fetchMore: jest.fn(),
    helpCenters,
})
const props: ManageHelpCentersProps = {
    helpCenterList: helpCenters,
    standaloneHelpCenters: [],
    isButtonDisabled: false,
    isHelpCenterLimitReached: false,
    isLoading: false,
    fetchMore: jest.fn(),
    hasMore: false,
}

describe('<ManageHelpCenters />', () => {
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

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ManageHelpCenters {...props} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should not render the "Create New" button while loading in still in progress', () => {
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ManageHelpCenters
                    {...props}
                    isLoading={true}
                    helpCenterList={[]}
                />
            </Provider>
        )

        expect(screen.queryByText(/create new/i)).toBeNull()
    })

    it('should render the empty list state when the component is loaded and the help center list is empty', () => {
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ManageHelpCenters
                    {...props}
                    isLoading={false}
                    helpCenterList={[]}
                />
            </Provider>
        )

        screen.getByText(/You have no Help Centers at the moment./i)
        screen.getByText(/create new/i)
    })

    it('should navigate to the creation page when clicking on the new button', () => {
        renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <ManageHelpCenters {...props} />
            </Provider>,
            {history: mockedHistory}
        )
        const newBtn = screen.getByText(/create new/i)
        fireEvent.click(newBtn)

        expect(mockedHistory.push).toHaveBeenCalledWith(
            '/app/settings/help-center/new'
        )
    })
})

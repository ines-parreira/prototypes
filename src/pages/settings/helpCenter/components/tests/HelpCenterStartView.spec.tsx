import React from 'react'
import {fireEvent} from '@testing-library/react'
import {createBrowserHistory} from 'history'
import configureMockStore from 'redux-mock-store'
import {Provider} from 'react-redux'

import HelpCenterStartView from '../HelpCenterStartView'
import {HELP_CENTER_BASE_PATH} from '../../constants'
import {renderWithRouter} from '../../../../../utils/testing'
import {getHelpcentersResponseFixture} from '../../fixtures/getHelpcenterResponse.fixture'
import {RootState, StoreDispatch} from '../../../../../state/types'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedHistory = {...createBrowserHistory(), push: jest.fn()}

describe('<HelpCenterStartView/>', () => {
    const defaultState: Partial<RootState> = {
        entities: {
            helpCenters: {
                '1': getHelpcentersResponseFixture[0],
                '2': getHelpcentersResponseFixture[1],
                '3': getHelpcentersResponseFixture[2],
            },
        } as any,
    }
    const props = {}

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>
        )
        expect(container).toMatchSnapshot()
    })

    it('should navigate to the creation page when clicking on the new button', async () => {
        const {findByText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterStartView {...props} />
            </Provider>,
            {history: mockedHistory}
        )
        const newBtn = await findByText(/add new/i)
        if (newBtn) {
            fireEvent.click(newBtn)
        }

        expect(mockedHistory.push).toHaveBeenLastCalledWith(
            `${HELP_CENTER_BASE_PATH}/new`
        )
    })
})

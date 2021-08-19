import React from 'react'
import {fireEvent} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {renderWithRouter} from '../../../../../utils/testing'
import {getHelpcentersResponseFixture} from '../../fixtures/getHelpcenterResponse.fixture'
import HelpCenterAppearanceView from '../HelpCenterAppearanceView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>()

const mockedUpdateHelpCenter = jest.fn().mockResolvedValue({
    data: getHelpcentersResponseFixture[0],
})

jest.mock('../../hooks/useHelpcenterApi', () => {
    return {
        useHelpcenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter,
            },
        }),
    }
})

const route = {
    path: '/app/settings/help-center/:helpcenterId/appearance',
    route: '/app/settings/help-center/1/appearance',
}

describe('<HelpCenterAppearanceView/>', () => {
    const defaultState: Partial<RootState> = {
        entities: {
            helpCenters: {
                '1': getHelpcentersResponseFixture[0],
            },
        } as any,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterAppearanceView />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })

    it('should call helpcenter API on search bar enabled', () => {
        const {getByRole} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterAppearanceView />
            </Provider>,
            route
        )

        fireEvent.click(getByRole('checkbox'))

        expect(mockedUpdateHelpCenter).toHaveBeenLastCalledWith(
            {
                help_center_id: 1,
            },
            {
                search_deactivated: false,
            }
        )
    })
})

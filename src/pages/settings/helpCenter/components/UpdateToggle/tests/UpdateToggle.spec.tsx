import React from 'react'
import {render, fireEvent} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {Components} from 'rest_api/help_center_api/client.generated'

import {RootState, StoreDispatch} from '../../../../../../state/types'
import {UpdateToggle} from '../UpdateToggle'

const mockedUpdateHelpCenter = jest.fn()
jest.mock('../../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter.mockResolvedValue({
                    data: {},
                }),
            },
        }),
    }
})

const mockNotify = jest.fn()
jest.mock('../../../../../../state/notifications/actions', () => ({
    notify: mockNotify,
}))

jest.mock('../../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: () => 1,
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

describe('<UpdateToggle />', () => {
    const props = {
        activated: true,
        label: 'label',
        description: 'description',
        fieldName:
            'search_deactivated' as keyof Components.Schemas.UpdateHelpCenterDto,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    it('should display the update toggle', () => {
        const {container} = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>
        )

        expect(container).toMatchSnapshot()
    })

    it('should trigger the update callback when clicking on the checkbox', async () => {
        const {findByRole} = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>
        )
        const toggle = await findByRole('checkbox')
        fireEvent.click(toggle)
        expect(mockedUpdateHelpCenter).toHaveBeenLastCalledWith(
            {help_center_id: 1},
            {search_deactivated: true}
        )
    })
})

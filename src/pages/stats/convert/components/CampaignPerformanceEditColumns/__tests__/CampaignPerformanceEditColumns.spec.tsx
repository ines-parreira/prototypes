import {render, screen} from '@testing-library/react'
import {createDragDropManager} from 'dnd-core'
import {fromJS} from 'immutable'
import React from 'react'

import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserRole} from 'config/types/user'
import {EditTableColumns} from 'pages/stats/common/components/Table/EditTableColumns'

import {RootState, StoreDispatch} from 'state/types'
import {assumeMock} from 'utils/testing'

import {CampaignPerformanceEditColumns} from '../CampaignPerformanceEditColumns'

const manager = createDragDropManager(HTML5Backend, undefined, undefined)

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

jest.mock('pages/stats/common/components/Table/EditTableColumns')
const EditTableColumnsMock = assumeMock(EditTableColumns)

const componentMock = () => <div>Edit Columns</div>

describe('<CampaignPerformanceEditColumns />', () => {
    EditTableColumnsMock.mockImplementation(componentMock)

    it('should render dropdown toggle button', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        role: {name: UserRole.Admin},
                    }),
                } as unknown as RootState)}
            >
                <DndProvider manager={manager}>
                    <CampaignPerformanceEditColumns />
                </DndProvider>
            </Provider>
        )

        expect(screen.getByText('Edit Columns')).toBeInTheDocument()
    })

    it('user is not admin, button is not visible', () => {
        render(
            <Provider store={mockStore({})}>
                <DndProvider manager={manager}>
                    <CampaignPerformanceEditColumns />
                </DndProvider>
            </Provider>
        )

        expect(screen.queryByText('Edit Columns')).not.toBeInTheDocument()
    })
})

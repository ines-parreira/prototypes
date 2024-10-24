import {QueryClientProvider} from '@tanstack/react-query'
import {render} from '@testing-library/react'
import React from 'react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {OBJECT_TYPES} from 'custom-fields/constants'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'

import AddCustomField from '../AddCustomField'

const mockStore = configureMockStore([thunk])()
const queryClient = mockQueryClient()

describe('<AddCustomField/>', () => {
    beforeEach(() => {
        queryClient.clear()
    })

    it('should render', () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <AddCustomField objectType={OBJECT_TYPES.TICKET} />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

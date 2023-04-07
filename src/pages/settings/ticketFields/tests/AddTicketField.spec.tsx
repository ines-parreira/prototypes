import React from 'react'
import {render} from '@testing-library/react'
import {DndProvider} from 'react-dnd'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {QueryClientProvider} from '@tanstack/react-query'

import {createTestQueryClient} from 'tests/reactQueryTestingUtils'
import AddTicketField from '../AddTicketField'

const mockStore = configureMockStore([thunk])()
const queryClient = createTestQueryClient()

describe('<AddTicketField/>', () => {
    beforeEach(async () => {
        await queryClient.invalidateQueries()
    })

    it('should render', () => {
        const {container} = render(
            <QueryClientProvider client={queryClient}>
                <Provider store={mockStore}>
                    <DndProvider backend={HTML5Backend}>
                        <AddTicketField />
                    </DndProvider>
                </Provider>
            </QueryClientProvider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })
})

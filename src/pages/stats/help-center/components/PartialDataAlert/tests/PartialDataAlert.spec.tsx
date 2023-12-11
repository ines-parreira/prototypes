import React from 'react'
import {render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import PartialDataAlert from '../PartialDataAlert'

const mockStore = configureMockStore([thunk])()

describe('<PartialDataAlert />', () => {
    it('should render with correct text', () => {
        render(
            <Provider store={mockStore}>
                <PartialDataAlert collectionStartDate="2023-11-16" />
            </Provider>
        )

        expect(
            screen.getByText(
                'There is only partial or no data available because we started collecting data from November 16, 2023.'
            )
        ).toBeInTheDocument()
    })
})

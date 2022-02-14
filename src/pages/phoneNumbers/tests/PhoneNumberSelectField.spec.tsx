import React from 'react'
import {render} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {RootState, StoreDispatch} from 'state/types'
import {PhoneNumber} from 'models/phoneNumber/types'
import {phoneNumbers} from 'fixtures/phoneNumber'

import PhoneNumberSelectField from '../PhoneNumberSelectField'

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()
const store = mockStore({
    entities: {
        phoneNumbers: phoneNumbers.reduce(
            (acc, number) => ({...acc, [number.id]: number}),
            {}
        ),
    },
} as RootState)

describe('<PhoneNumberSelectField/>', () => {
    const onCreate: jest.MockedFunction<(value: PhoneNumber) => void> =
        jest.fn()
    const onChange: jest.MockedFunction<(value: PhoneNumber) => void> =
        jest.fn()

    describe('render()', () => {
        it('should render', () => {
            const {container} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value={phoneNumbers[0]}
                        onChange={onChange}
                        onCreate={onCreate}
                    />
                </Provider>
            )
            expect(container.firstChild).toMatchSnapshot()
        })

        it('should open a modal form when selecting the create option', () => {
            const {baseElement} = render(
                <Provider store={store}>
                    <PhoneNumberSelectField
                        value="_new"
                        onChange={onChange}
                        onCreate={onCreate}
                    />
                </Provider>
            )
            expect(baseElement).toMatchSnapshot()
        })
    })
})

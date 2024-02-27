import React from 'react'
import {render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'
import {RedirectProps} from 'react-router-dom'
import {RootState, StoreDispatch} from 'state/types'
import ConvertRoute from '../ConvertRoute'

jest.mock('react-router-dom', () => {
    return {
        Redirect: jest.fn(
            ({to}: RedirectProps) => `Redirected to ${to.toString()}`
        ),
    }
})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('ConvertRoute', () => {
    afterAll(() => {
        jest.resetAllMocks()
    })

    it('redirects to /app when there are no sorted integrations', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({
                integrations: [],
            }),
        }

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(getByText('Redirected to /app')).toBeInTheDocument()
    })

    it('redirects to installation page of the alphabetically first integration', () => {
        const state: Partial<RootState> = {
            integrations: fromJS({
                integrations: [
                    {id: 1, type: 'gorgias_chat', name: 'Best chat'},
                    {id: 2, type: 'gorgias_chat', name: 'A bit worse chat'},
                ],
            }),
        }

        const {getByText} = render(
            <Provider store={mockStore(state)}>
                <ConvertRoute />
            </Provider>
        )

        expect(
            getByText('Redirected to /app/convert/2/installation')
        ).toBeInTheDocument()
    })
})

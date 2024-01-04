import {Provider} from 'react-redux'
import React from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import {mockStore} from 'utils/testing'
import {createVerification} from 'models/singleSenderVerification/resources'
import useBulkCreateSingleSenderVerification from '../hooks/useBulkCreateSingleSenderVerification'

jest.mock('models/singleSenderVerification/resources')

describe('useBulkCreateSingleSenderVerification', () => {
    const wrapper = ({children}: any) => {
        return <Provider store={mockStore({} as any)}>{children}</Provider>
    }

    it('should call createVerification for each integration', () => {
        const {result} = renderHook(useBulkCreateSingleSenderVerification, {
            wrapper,
        })
        const integrations = [
            {id: 1, meta: {address: 'email1@gorgias.com'}},
            {id: 2, meta: {address: 'email2@gorgias.com'}},
        ] as any
        const values = {
            address: 'address',
            city: 'city',
            country: 'country',
            state: 'state',
            zip: 'zip',
        } as any

        void act(() => {
            void result.current.bulkCreateSingleSenderVerification(
                integrations,
                values
            )
        })

        expect(createVerification).toHaveBeenCalledTimes(2)
        expect(createVerification).toHaveBeenCalledWith(1, {
            address: 'address',
            city: 'city',
            country: 'country',
            email: 'email1@gorgias.com',
            state: 'state',
            zip: 'zip',
        })
        expect(createVerification).toHaveBeenCalledWith(2, {
            address: 'address',
            city: 'city',
            country: 'country',
            email: 'email2@gorgias.com',
            state: 'state',
            zip: 'zip',
        })
    })
})

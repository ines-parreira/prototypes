import {Provider} from 'react-redux'
import React from 'react'
import {act, renderHook} from '@testing-library/react-hooks'
import {mockStore} from 'utils/testing'
import {deleteVerification} from 'models/singleSenderVerification/resources'
import useDeleteSingleSenderVerification from '../hooks/useDeleteSingleSenderVerification'

jest.mock('models/singleSenderVerification/resources')

describe('useBulkCreateSingleSenderVerification', () => {
    const wrapper = ({children}: any) => {
        return <Provider store={mockStore({} as any)}>{children}</Provider>
    }

    it('should call deleteVerification', () => {
        const {result} = renderHook(useDeleteSingleSenderVerification, {
            wrapper,
        })

        void act(() => {
            void result.current.deleteVerification(1)
        })

        expect(deleteVerification).toHaveBeenCalledWith(1)
    })
})

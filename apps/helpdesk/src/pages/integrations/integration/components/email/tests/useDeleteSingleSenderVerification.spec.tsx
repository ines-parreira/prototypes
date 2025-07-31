import React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import { Provider } from 'react-redux'

import { deleteVerification } from 'models/singleSenderVerification/resources'
import { mockStore } from 'utils/testing'

import useDeleteSingleSenderVerification from '../hooks/useDeleteSingleSenderVerification'

jest.mock('models/singleSenderVerification/resources')

describe('useBulkCreateSingleSenderVerification', () => {
    const wrapper = ({ children }: any) => {
        return <Provider store={mockStore({} as any)}>{children}</Provider>
    }

    it('should call deleteVerification', () => {
        const { result } = renderHook(useDeleteSingleSenderVerification, {
            wrapper,
        })

        void act(() => {
            void result.current.deleteVerification(1)
        })

        expect(deleteVerification).toHaveBeenCalledWith(1)
    })
})

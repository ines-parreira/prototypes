import React from 'react'

import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'

import { deleteVerification } from 'models/singleSenderVerification/resources'

import { useDeleteSingleSenderVerification } from '../hooks/useDeleteSingleSenderVerification'

jest.mock('models/singleSenderVerification/resources')

describe('useBulkCreateSingleSenderVerification', () => {
    it('should call deleteVerification', () => {
        const { result } = renderHook(useDeleteSingleSenderVerification)

        void act(() => {
            void result.current.deleteVerification(1)
        })

        expect(deleteVerification).toHaveBeenCalledWith(1)
    })
})

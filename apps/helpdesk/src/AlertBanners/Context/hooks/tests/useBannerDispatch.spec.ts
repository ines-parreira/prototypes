import React from 'react'

import { renderHook } from '@repo/testing'

import { BannersDispatchContext } from '../../context'
import { useBannersDispatchContext } from '../useBannersDispatchContext'

jest.spyOn(React, 'useContext')

describe('useBannersDispatchContext', () => {
    it('should return the context values', () => {
        const { result } = renderHook(useBannersDispatchContext)

        expect(React.useContext).toHaveBeenCalledWith(BannersDispatchContext)
        expect(result.current).toEqual(expect.any(Function))
    })
})

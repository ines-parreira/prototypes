import React from 'react'

import { renderHook } from '@repo/testing'

import { BannersContext } from '../../context'
import { useBannersContext } from '../useBannersContext'

jest.spyOn(React, 'useContext')

describe('useBannersContext', () => {
    it('should return the context values', () => {
        const { result } = renderHook(useBannersContext)

        expect(React.useContext).toHaveBeenCalledWith(BannersContext)
        expect(result.current).toEqual([])
    })
})

import {renderHook} from '@testing-library/react-hooks'
import React from 'react'

import {BannerActionTypes, BannerCategories, ContextBanner} from '../../types'
import {useBanners} from '../useBanners'

const data: ContextBanner = {
    category: BannerCategories.IMPERSONATION,
    instanceId: '1',
    message: 'Test',
}

describe('useBanners', () => {
    it('should return the correct mapping functions', () => {
        const dispatch = jest.fn()
        jest.spyOn(React, 'useContext').mockReturnValue(dispatch)
        const {result} = renderHook(useBanners)
        const {
            addBanner,
            forceAddBanner,
            removeCategory,
            removeBanner,
            dismissBanner,
        } = result.current

        addBanner(data)
        expect(dispatch).toHaveBeenLastCalledWith({
            type: BannerActionTypes.ADD,
            payload: data,
        })

        forceAddBanner(data)
        expect(dispatch).toHaveBeenLastCalledWith({
            type: BannerActionTypes.FORCE_ADD,
            payload: data,
        })

        removeCategory(BannerCategories.IMPERSONATION)
        expect(dispatch).toHaveBeenLastCalledWith({
            type: BannerActionTypes.REMOVE_CATEGORY,
            category: BannerCategories.IMPERSONATION,
        })

        removeBanner(BannerCategories.IMPERSONATION, '1')
        expect(dispatch).toHaveBeenLastCalledWith({
            type: BannerActionTypes.REMOVE_BANNER,
            category: BannerCategories.IMPERSONATION,
            instanceId: '1',
        })

        dismissBanner(BannerCategories.IMPERSONATION, '1')
        expect(dispatch).toHaveBeenLastCalledWith({
            type: BannerActionTypes.DISMISS_BANNER,
            category: BannerCategories.IMPERSONATION,
            instanceId: '1',
        })
    })
})

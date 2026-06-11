import { renderHook } from '@repo/testing'
import { fromJS } from 'immutable'

import { useAppSelector } from 'hooks/useAppSelector'

import { useSocialsIntegrations } from '../useSocialsIntegrations'

jest.mock('hooks/useAppSelector')

const mockUseAppSelector = jest.mocked(useAppSelector)

const makeFacebookIntegration = (overrides: any = {}) => ({
    id: 1,
    type: 'facebook',
    meta: {
        name: 'Brand FB Page',
        instagram: {
            username: 'brand_ig',
        },
    },
    ...overrides,
})

describe('useSocialsIntegrations', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns Facebook integrations that have an Instagram account connected', () => {
        const integrations = [
            makeFacebookIntegration({
                id: 1,
                meta: {
                    name: 'Brand FB Page',
                    instagram: { username: 'brand_ig' },
                },
            }),
            makeFacebookIntegration({
                id: 2,
                meta: {
                    name: 'Other Brand',
                    instagram: { username: 'other_brand' },
                },
            }),
        ]
        mockUseAppSelector.mockReturnValue(fromJS(integrations))

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([
            { id: 1, pageName: 'Brand FB Page', instagramUsername: 'brand_ig' },
            {
                id: 2,
                pageName: 'Other Brand',
                instagramUsername: 'other_brand',
            },
        ])
    })

    it('filters out Facebook integrations without an Instagram account', () => {
        const integrations = [
            makeFacebookIntegration({
                id: 1,
                meta: { name: 'FB without IG' },
            }),
            makeFacebookIntegration({
                id: 2,
                meta: {
                    name: 'With IG',
                    instagram: { username: 'with_ig' },
                },
            }),
        ]
        mockUseAppSelector.mockReturnValue(fromJS(integrations))

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([
            { id: 2, pageName: 'With IG', instagramUsername: 'with_ig' },
        ])
    })

    it('falls back to empty strings when meta fields are missing', () => {
        const integrations = [
            makeFacebookIntegration({
                id: 3,
                meta: { instagram: {} },
            }),
        ]
        mockUseAppSelector.mockReturnValue(fromJS(integrations))

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([
            { id: 3, pageName: '', instagramUsername: '' },
        ])
    })

    it('returns an empty array when there are no integrations', () => {
        mockUseAppSelector.mockReturnValue(fromJS([]))

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([])
    })

    it('supports plain arrays from the selector', () => {
        const integrations = [
            {
                id: 4,
                type: 'facebook',
                meta: {
                    name: 'Plain Array Brand',
                    instagram: { username: 'plain_ig' },
                },
            },
        ]
        mockUseAppSelector.mockReturnValue(integrations as any)

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([
            {
                id: 4,
                pageName: 'Plain Array Brand',
                instagramUsername: 'plain_ig',
            },
        ])
    })

    it('returns an empty array when the selector returns an unsupported value', () => {
        mockUseAppSelector.mockReturnValue(undefined as any)

        const { result } = renderHook(() => useSocialsIntegrations())

        expect(result.current).toEqual([])
    })
})

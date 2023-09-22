import {act, renderHook} from '@testing-library/react-hooks'

import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'

import {createTrigger} from '../../utils/createTrigger'

import {CampaignTriggerKey} from '../../types/enums/CampaignTriggerKey.enum'

import {useManageTriggers} from '../useManageTriggers'

describe('useManageTriggers()', () => {
    beforeAll(() => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
    })

    it('initialize with current url trigger if no default is provided', () => {
        const {result} = renderHook(() => useManageTriggers())

        expect(Object.values(result.current.triggers)).toEqual([
            createTrigger(CampaignTriggerKey.CurrentUrl),
        ])
    })

    it('sets the default triggers', () => {
        const defaultTriggers = [
            createTrigger(CampaignTriggerKey.CurrentUrl),
            createTrigger(CampaignTriggerKey.BusinessHours),
        ]

        const {result} = renderHook(() => useManageTriggers(defaultTriggers))

        expect(Object.values(result.current.triggers)).toEqual(defaultTriggers)
    })

    it('adds a trigger', () => {
        const {result} = renderHook(() => useManageTriggers())

        act(() => {
            result.current.addTrigger(CampaignTriggerKey.BusinessHours)
        })

        expect(Object.values(result.current.triggers)).toEqual([
            createTrigger(CampaignTriggerKey.CurrentUrl),
            createTrigger(CampaignTriggerKey.BusinessHours),
        ])

        const triggerWithPayload = {
            ...createTrigger(CampaignTriggerKey.SessionTime),
            value: 10,
        }

        act(() => {
            result.current.addTrigger(
                CampaignTriggerKey.SessionTime,
                triggerWithPayload
            )
        })

        expect(Object.values(result.current.triggers)).toEqual([
            createTrigger(CampaignTriggerKey.CurrentUrl),
            createTrigger(CampaignTriggerKey.BusinessHours),
            triggerWithPayload,
        ])
    })

    it('updates a trigger', () => {
        const {result} = renderHook(() => useManageTriggers())

        act(() => {
            result.current.updateTrigger(
                Object.keys(result.current.triggers)[0],
                {
                    value: 'test',
                }
            )
        })

        expect(Object.values(result.current.triggers)).toEqual([
            {
                ...createTrigger(CampaignTriggerKey.CurrentUrl),
                value: 'test',
            },
        ])
    })

    it('deletes a trigger', () => {
        const {result} = renderHook(() => useManageTriggers())

        act(() => {
            result.current.deleteTrigger(
                Object.keys(result.current.triggers)[0]
            )
        })

        expect(Object.values(result.current.triggers)).toEqual([])
    })
})

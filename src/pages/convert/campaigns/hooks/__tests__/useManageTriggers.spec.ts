import {act, renderHook} from '@testing-library/react-hooks'

import _omit from 'lodash/omit'
import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'

import {createTrigger} from '../../utils/createTrigger'

import {CampaignTriggerType} from '../../types/enums/CampaignTriggerType.enum'

import {useManageTriggers} from '../useManageTriggers'
import {CampaignTrigger} from '../../types/CampaignTrigger'

describe('useManageTriggers()', () => {
    beforeAll(() => {
        jest.spyOn(
            revenueBetaHook,
            'useIsConvertSubscriber'
        ).mockImplementation(() => true)
    })

    it('initialize with current url trigger if no default is provided', () => {
        const {result} = renderHook(() => useManageTriggers())

        const defaultTrigger = _omit(
            Object.values(result.current.triggers)[0],
            'id'
        )
        const expectedTrigger = _omit(
            createTrigger(CampaignTriggerType.CurrentUrl),
            'id'
        )

        expect(defaultTrigger).toEqual(expectedTrigger)
    })

    it('sets the default triggers', () => {
        const defaultTriggers = [
            createTrigger(CampaignTriggerType.CurrentUrl),
            createTrigger(CampaignTriggerType.BusinessHours),
        ]

        const {result} = renderHook(() => useManageTriggers(defaultTriggers))

        expect(Object.values(result.current.triggers)).toEqual(defaultTriggers)
    })

    it('adds a trigger', () => {
        const {result} = renderHook(() => useManageTriggers())

        act(() => {
            result.current.addTrigger(CampaignTriggerType.BusinessHours)
        })

        const removeIds = (triggers: CampaignTrigger[]) =>
            triggers.map((trigger: CampaignTrigger) => _omit(trigger, 'id'))

        expect(removeIds(Object.values(result.current.triggers))).toEqual(
            removeIds([
                createTrigger(CampaignTriggerType.CurrentUrl),
                createTrigger(CampaignTriggerType.BusinessHours),
            ])
        )

        const triggerWithPayload = {
            ...createTrigger(CampaignTriggerType.SessionTime),
            value: 10,
        }

        act(() => {
            result.current.addTrigger(
                CampaignTriggerType.SessionTime,
                triggerWithPayload
            )
        })

        expect(removeIds(Object.values(result.current.triggers))).toEqual(
            removeIds([
                createTrigger(CampaignTriggerType.CurrentUrl),
                createTrigger(CampaignTriggerType.BusinessHours),
                triggerWithPayload,
            ])
        )
    })

    it('updates a trigger', () => {
        const {result} = renderHook(() => useManageTriggers())
        const defaultTrigger = Object.values(result.current.triggers)[0]

        act(() => {
            result.current.updateTrigger(defaultTrigger.id, {
                ...defaultTrigger,
                value: 'test',
            })
        })

        expect(Object.values(result.current.triggers)).toEqual([
            {
                ...defaultTrigger,
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

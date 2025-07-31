import { renderHook } from '@repo/testing'
import { act } from '@testing-library/react'
import _omit from 'lodash/omit'

import * as revenueBetaHook from 'pages/common/hooks/useIsConvertSubscriber'

import { CampaignTrigger } from '../../types/CampaignTrigger'
import { CampaignTriggerType } from '../../types/enums/CampaignTriggerType.enum'
import { createTrigger } from '../../utils/createTrigger'
import { useManageTriggers } from '../useManageTriggers'

const removeIds = (triggers: CampaignTrigger[]) =>
    triggers.map((trigger: CampaignTrigger) => _omit(trigger, 'id'))

describe('useManageTriggers()', () => {
    describe('is not convert subscriber', () => {
        beforeAll(() => {
            jest.spyOn(
                revenueBetaHook,
                'useIsConvertSubscriber',
            ).mockImplementation(() => false)
        })

        it('initialize with current url trigger if no default is provided', () => {
            const { result } = renderHook(() => useManageTriggers())

            expect(removeIds(Object.values(result.current.triggers))).toEqual(
                removeIds([createTrigger(CampaignTriggerType.CurrentUrl)]),
            )
        })
    })

    describe('is convert subscriber', () => {
        beforeAll(() => {
            jest.spyOn(
                revenueBetaHook,
                'useIsConvertSubscriber',
            ).mockImplementation(() => true)
        })

        it('initialize with current url trigger and business hours trigger if no default is provided', () => {
            const { result } = renderHook(() => useManageTriggers())

            expect(removeIds(Object.values(result.current.triggers))).toEqual(
                removeIds([
                    createTrigger(CampaignTriggerType.CurrentUrl),
                    createTrigger(CampaignTriggerType.BusinessHours),
                ]),
            )
        })

        it('sets the default triggers', () => {
            const defaultTriggers = [
                createTrigger(CampaignTriggerType.CurrentUrl),
                createTrigger(CampaignTriggerType.BusinessHours),
            ]

            const { result } = renderHook(() =>
                useManageTriggers(defaultTriggers),
            )

            expect(Object.values(result.current.triggers)).toEqual(
                defaultTriggers,
            )
        })

        it('adds a trigger', () => {
            const { result } = renderHook(() => useManageTriggers())

            act(() => {
                result.current.addTrigger(CampaignTriggerType.TimeSpentOnPage)
            })

            expect(removeIds(Object.values(result.current.triggers))).toEqual(
                removeIds([
                    createTrigger(CampaignTriggerType.CurrentUrl),
                    createTrigger(CampaignTriggerType.BusinessHours),
                    createTrigger(CampaignTriggerType.TimeSpentOnPage),
                ]),
            )

            const triggerWithPayload = {
                ...createTrigger(CampaignTriggerType.SessionTime),
                value: 10,
            }

            act(() => {
                result.current.addTrigger(
                    CampaignTriggerType.SessionTime,
                    triggerWithPayload,
                )
            })

            expect(removeIds(Object.values(result.current.triggers))).toEqual(
                removeIds([
                    createTrigger(CampaignTriggerType.CurrentUrl),
                    createTrigger(CampaignTriggerType.BusinessHours),
                    createTrigger(CampaignTriggerType.TimeSpentOnPage),
                    triggerWithPayload,
                ]),
            )
        })

        it('updates a trigger', () => {
            const { result } = renderHook(() => useManageTriggers())
            const [defaultCurrentTrigger, defaultBusinessHourTrigger] =
                Object.values(result.current.triggers)

            act(() => {
                result.current.updateTrigger(defaultCurrentTrigger.id, {
                    ...defaultCurrentTrigger,
                    value: 'test',
                })
            })

            expect(Object.values(result.current.triggers)).toEqual([
                {
                    ...defaultCurrentTrigger,
                    value: 'test',
                },
                {
                    ...defaultBusinessHourTrigger,
                },
            ])
        })

        it('deletes a trigger', () => {
            const { result } = renderHook(() => useManageTriggers())
            const triggersKeys = Object.keys(result.current.triggers)
            act(() => {
                result.current.deleteTrigger(triggersKeys[0])
            })

            expect(Object.values(result.current.triggers).length).toEqual(1)
            expect(removeIds(Object.values(result.current.triggers))).toEqual(
                removeIds([createTrigger(CampaignTriggerType.BusinessHours)]),
            )
        })
    })
})

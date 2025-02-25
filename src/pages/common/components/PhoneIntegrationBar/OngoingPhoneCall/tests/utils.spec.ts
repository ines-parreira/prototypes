import { AvailabilityStatusTag } from 'config/types/user'

import { getAvailabilityBadgeColor, mergeAgentData } from '../utils'

describe('utils', () => {
    describe('mergeAgentData', () => {
        it('should merge agents data with status', () => {
            const agentsData = [
                {
                    id: 1,
                    name: 'Agent 1',
                    meta: { profile_picture_url: 'url1' },
                },
                {
                    id: 2,
                    name: 'Agent 2',
                    meta: { profile_picture_url: 'url2' },
                },
                {
                    id: 3,
                    name: 'Agent 3',
                    meta: { profile_picture_url: 'url3' },
                },
            ]
            const agentsDataWithStatus = [
                {
                    id: 1,
                    availability_status: {
                        status: AvailabilityStatusTag.Online,
                    },
                },
                {
                    id: 2,
                    availability_status: {
                        status: AvailabilityStatusTag.Offline,
                    },
                },
            ]

            const mergedData = mergeAgentData(
                agentsData as any,
                agentsDataWithStatus as any,
            )

            expect(mergedData).toEqual([
                {
                    id: 1,
                    status: AvailabilityStatusTag.Online,
                    name: 'Agent 1',
                    meta: { profile_picture_url: 'url1' },
                },
                {
                    id: 2,
                    status: AvailabilityStatusTag.Offline,
                    name: 'Agent 2',
                    meta: { profile_picture_url: 'url2' },
                },
                {
                    id: 3,
                    name: 'Agent 3',
                    meta: { profile_picture_url: 'url3' },
                },
            ])
        })
    })

    describe('getAvailabilityBadgeColor', () => {
        it('should return the correct badge color for available status', () => {
            const status = AvailabilityStatusTag.Online
            const badgeColor = getAvailabilityBadgeColor(status)

            expect(badgeColor).toBe('var(--feedback-success)')
        })

        it('should return the correct badge color for offline status', () => {
            const status = AvailabilityStatusTag.Offline
            const badgeColor = getAvailabilityBadgeColor(status)

            expect(badgeColor).toBe('var(--neutral-grey-4)')
        })

        it('should return the correct badge color for busy status', () => {
            const status = AvailabilityStatusTag.Busy
            const badgeColor = getAvailabilityBadgeColor(status)

            expect(badgeColor).toBe('var(--feedback-warning)')
        })

        it('should return undefined for unknown status', () => {
            const status = 'unknown'
            const badgeColor = getAvailabilityBadgeColor(status)

            expect(badgeColor).toBeUndefined()
        })
    })
})

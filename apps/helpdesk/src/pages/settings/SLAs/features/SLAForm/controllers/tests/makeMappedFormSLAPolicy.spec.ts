import type { SLAPolicy } from '@gorgias/helpdesk-queries'
import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { slaPolicy3 } from 'pages/settings/SLAs/fixtures/fixtures'

import makeMappedFormSLAPolicy from '../makeMappedFormSLAPolicy'

describe('makeMappedFormSLAPolicy', () => {
    it('should map SLAPolicy to MappedFormSLAPolicy correctly', () => {
        const expectedMappedPolicy = {
            uuid: '3',
            name: 'policy',
            target_channels: ['email', 'chat'],
            business_hours_only: true,
            active: true,
            metrics: {
                [SLAPolicyMetricType.Frt]: {
                    threshold: 30,
                    unit: SLAPolicyMetricUnit.Minute,
                },
                [SLAPolicyMetricType.Rt]: {
                    threshold: 120,
                    unit: SLAPolicyMetricUnit.Minute,
                },
            },
        }

        const result = makeMappedFormSLAPolicy(slaPolicy3)

        expect(result).toEqual(expectedMappedPolicy)
    })

    it('should set active to false if deactivated_datetime is not null', () => {
        const policy: SLAPolicy = {
            ...slaPolicy3,
            deactivated_datetime: '2025-01-01T00:00:00Z',
        }

        const expectedMappedPolicy = {
            uuid: '3',
            name: 'policy',
            target_channels: ['email', 'chat'],
            business_hours_only: true,
            active: false,
            metrics: {
                [SLAPolicyMetricType.Frt]: {
                    threshold: 30,
                    unit: SLAPolicyMetricUnit.Minute,
                },
                [SLAPolicyMetricType.Rt]: {
                    threshold: 120,
                    unit: SLAPolicyMetricUnit.Minute,
                },
            },
        }

        const result = makeMappedFormSLAPolicy(policy)

        expect(result).toEqual(expectedMappedPolicy)
    })
})

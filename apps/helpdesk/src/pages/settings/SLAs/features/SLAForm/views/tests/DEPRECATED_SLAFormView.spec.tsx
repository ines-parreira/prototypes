import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import type { MappedFormSLAPolicy } from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'
import { renderWithRouter } from 'utils/testing'

import SLAFormView from '../DEPRECATED_SLAFormView'

const mockOnSubmit = jest.fn()
const mockValidator = jest.fn()

jest.mock('../DeleteModal', () => ({
    DeleteModal: () => <div>DeleteModal</div>,
}))

jest.mock('@repo/feature-flags', () => ({
    ...jest.requireActual('@repo/feature-flags'),
    useFlag: jest.fn(),
}))

const mockUseFlag = useFlag as jest.Mock

const defaultValues = {
    name: '',
    metrics: [
        {
            name: SLAPolicyMetricType.Frt,
            unit: SLAPolicyMetricUnit.Second,
            threshold: undefined,
        },
        {
            name: SLAPolicyMetricType.Rt,
            unit: SLAPolicyMetricUnit.Second,
            threshold: undefined,
        },
    ],
    target: undefined,
    active: true,
    target_channels: [],
    business_hours_only: false,
}

const defaultProps: ComponentProps<typeof SLAFormView> = {
    policy: undefined,
    defaultValues,
    values: {
        ...defaultValues,
        name: 'Foo SLA',
        metrics: [
            {
                name: SLAPolicyMetricType.Frt,
                unit: SLAPolicyMetricUnit.Second,
                threshold: 30,
            },
            {
                name: SLAPolicyMetricType.Rt,
                unit: SLAPolicyMetricUnit.Second,
                threshold: 60,
            },
        ],
    },
    onSubmit: mockOnSubmit,
    isLoading: false,
    validator: mockValidator,
}

describe('SLAFormView', () => {
    beforeEach(() => {
        mockUseFlag.mockReturnValue(false)
    })

    it('renders the form', () => {
        const { getByDisplayValue, getByText } = renderWithRouter(
            <SLAFormView {...defaultProps} />,
        )

        expect(getByDisplayValue('Foo SLA')).toBeInTheDocument()
        expect(getByDisplayValue('30')).toBeInTheDocument()
        expect(getByDisplayValue('60')).toBeInTheDocument()
        expect(
            getByText('Pause SLA timer outside of business hours'),
        ).toBeInTheDocument()
    })

    it('redirects to SLA list if voice policy is provided', () => {
        const voicePolicy: MappedFormSLAPolicy = {
            target_channels: ['phone'],
            target: 0.9,
            metrics: {
                [SLAPolicyMetricType.WaitTime]: {
                    threshold: 1,
                    unit: SLAPolicyMetricUnit.Minute,
                },
            },
            active: true,
            business_hours_only: true,
        } as MappedFormSLAPolicy

        const { container } = renderWithRouter(
            <SLAFormView {...defaultProps} policy={voicePolicy} />,
        )

        expect(container.textContent).toBe('')
    })
})

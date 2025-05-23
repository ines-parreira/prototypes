import React, { ComponentProps } from 'react'

import { render } from '@testing-library/react'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import { useFlag } from 'core/flags'

import SLAFormView from '../SLAFormView'

const mockOnSubmit = jest.fn()
const mockValidator = jest.fn()

jest.mock('../DeleteModal', () => ({
    DeleteModal: () => <div>DeleteModal</div>,
}))

jest.mock('core/flags', () => ({
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
        const { getByDisplayValue } = render(<SLAFormView {...defaultProps} />)

        expect(getByDisplayValue('Foo SLA')).toBeInTheDocument()
        expect(getByDisplayValue('30')).toBeInTheDocument()
        expect(getByDisplayValue('60')).toBeInTheDocument()
    })

    it('renders the form with business_hours_only field when FF is ON', () => {
        mockUseFlag.mockReturnValue(true)
        const { getByText } = render(<SLAFormView {...defaultProps} />)

        expect(
            getByText('Pause SLA timer outside of business hours'),
        ).toBeInTheDocument()
    })
})

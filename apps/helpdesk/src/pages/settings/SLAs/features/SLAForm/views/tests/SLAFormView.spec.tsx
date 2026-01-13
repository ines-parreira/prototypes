import type { ComponentProps } from 'react'

import { useFlag } from '@repo/feature-flags'
import { screen } from '@testing-library/react'

import {
    SLAPolicyMetricType,
    SLAPolicyMetricUnit,
} from '@gorgias/helpdesk-types'

import type { MappedFormSLAPolicy } from 'pages/settings/SLAs/features/SLAForm/controllers/makeMappedFormSLAPolicy'
import { renderWithRouter } from 'utils/testing'

import { SLAFormView } from '../SLAFormView'

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
    active: true,
    target_channels: [],
    target: null,
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
        renderWithRouter(<SLAFormView {...defaultProps} />)

        expect(screen.getByDisplayValue('Foo SLA')).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: /Save changes/i }),
        ).toBeInTheDocument()
        expect(
            screen.getByRole('button', { name: 'Cancel' }),
        ).toBeInTheDocument()
    })

    it('renders the delete button when policy is provided', () => {
        renderWithRouter(
            <SLAFormView
                {...defaultProps}
                policy={defaultValues as unknown as MappedFormSLAPolicy}
            />,
        )

        expect(
            screen.getByRole('button', { name: 'Delete SLA' }),
        ).toBeInTheDocument()
    })
})

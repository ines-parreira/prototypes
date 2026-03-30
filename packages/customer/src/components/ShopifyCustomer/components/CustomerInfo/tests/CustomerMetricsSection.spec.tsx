import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import { render } from '../../../../../tests/render.utils'
import { CustomerMetricsSection } from '../CustomerMetricsSection'
import type { FieldConfig, FieldRenderContext } from '../types'
import type { SectionFieldData } from '../widget/customerFieldPreferences.utils'

const mockContext: FieldRenderContext = {
    purchaseSummary: undefined,
    shopper: undefined,
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.TwentyFourHour,
    integrationId: undefined,
    externalId: undefined,
    customerId: undefined,
    ticketId: undefined,
    emailMarketingConsent: undefined,
    smsMarketingConsent: undefined,
}

const makeField = (id: string, label: string): FieldConfig => ({
    id,
    type: 'readonly',
    label,
    getValue: () => 'value',
    formatValue: () => 'formatted',
})

describe('CustomerMetricsSection', () => {
    const defaultProps = {
        fields: [makeField('totalSpent', 'Total spent')],
        context: mockContext,
        onEditMetricsClick: vi.fn(),
        sections: [] as SectionFieldData[],
    }

    it('renders collapsible sections from sections prop', () => {
        const sections: SectionFieldData[] = [
            {
                key: 'defaultAddress',
                label: 'Default address',
                fields: [makeField('city', 'City')],
            },
        ]

        render(<CustomerMetricsSection {...defaultProps} sections={sections} />)

        expect(screen.getByText('Default address')).toBeInTheDocument()
    })

    it('renders multiple sections', () => {
        const sections: SectionFieldData[] = [
            {
                key: 'defaultAddress',
                label: 'Default address',
                fields: [makeField('city', 'City')],
            },
            {
                key: 'emailMarketingConsent',
                label: 'Email marketing',
                fields: [makeField('consent', 'Consent')],
            },
        ]

        render(<CustomerMetricsSection {...defaultProps} sections={sections} />)

        expect(screen.getByText('Default address')).toBeInTheDocument()
        expect(screen.getByText('Email marketing')).toBeInTheDocument()
    })

    it('resolves address sections per address entry', () => {
        const contextWithAddresses: FieldRenderContext = {
            ...mockContext,
            shopper: {
                data: {
                    addresses: [{ city: 'New York' }, { city: 'London' }],
                },
            } as FieldRenderContext['shopper'],
        }

        const sections: SectionFieldData[] = [
            {
                key: 'addresses',
                label: 'Addresses',
                fields: [makeField('city', 'City')],
            },
        ]

        render(
            <CustomerMetricsSection
                {...defaultProps}
                context={contextWithAddresses}
                sections={sections}
            />,
        )

        const addressHeaders = screen.getAllByText('Address')
        expect(addressHeaders).toHaveLength(2)
    })

    it('renders no collapsible sections when sections is empty', () => {
        const { container } = render(
            <CustomerMetricsSection {...defaultProps} sections={[]} />,
        )

        expect(
            container.querySelector('[data-disclosure]'),
        ).not.toBeInTheDocument()
    })
})

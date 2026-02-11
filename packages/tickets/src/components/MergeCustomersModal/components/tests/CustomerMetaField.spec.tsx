import { act, screen, waitFor } from '@testing-library/react'

import { render } from '../../../../tests/render.utils'
import { CustomerSelection } from '../../hooks/useMergeCustomersState'
import { CustomerMetaField } from '../CustomerMetaField'

describe('CustomerMetaField', () => {
    const mockDestinationData = {
        age: 30,
        city: 'New York',
        preferences: { newsletter: true },
    }

    const mockSourceData = {
        age: 25,
        city: 'San Francisco',
        occupation: 'Engineer',
    }

    const mockOnChange = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should render both destination and source data', () => {
        render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
            />,
        )

        const ageElements = screen.getAllByText('age')
        expect(ageElements).toHaveLength(2)
        expect(screen.getByText('30')).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should show destination as selected when selectedValue is destination', () => {
        render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
            />,
        )

        const radios = screen.getAllByRole('radio')
        expect(radios[0]).toBeChecked()
        expect(radios[1]).not.toBeChecked()
    })

    it('should show source as selected when selectedValue is source', () => {
        render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Source}
                onChange={mockOnChange}
            />,
        )

        const radios = screen.getAllByRole('radio')
        expect(radios[0]).not.toBeChecked()
        expect(radios[1]).toBeChecked()
    })

    it('should call onChange when card is clicked', async () => {
        const { user } = render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Source}
                onChange={mockOnChange}
            />,
        )

        const radios = screen.getAllByRole('radio')
        await act(async () => {
            await user.click(radios[0])
        })

        await waitFor(() => {
            expect(mockOnChange).toHaveBeenCalledWith(
                CustomerSelection.Destination,
            )
            expect(mockOnChange).toHaveBeenCalledTimes(1)
        })
    })

    it('should disable both cards when isDisabled is true', () => {
        render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
                isDisabled={true}
            />,
        )

        const radios = screen.getAllByRole('radio')
        expect(radios[0]).toBeDisabled()
        expect(radios[1]).toBeDisabled()
    })

    it('should render empty object when destination data is empty', () => {
        render(
            <CustomerMetaField
                destinationData={{}}
                sourceData={mockSourceData}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('{}')).toBeInTheDocument()
        expect(screen.getByText('age')).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument()
    })

    it('should render empty object when source data is empty', () => {
        render(
            <CustomerMetaField
                destinationData={mockDestinationData}
                sourceData={{}}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('age')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
        const emptyObjects = screen.getAllByText('{}')
        expect(emptyObjects.length).toBeGreaterThan(0)
    })

    it('should filter out _shopify data', () => {
        const dataWithShopify = {
            age: 30,
            _shopify: { customer_id: '12345' },
        }

        render(
            <CustomerMetaField
                destinationData={dataWithShopify}
                sourceData={{}}
                selectedValue={CustomerSelection.Destination}
                onChange={mockOnChange}
            />,
        )

        expect(screen.getByText('age')).toBeInTheDocument()
        expect(screen.getByText('30')).toBeInTheDocument()
        expect(screen.queryByText('_shopify')).not.toBeInTheDocument()
    })
})

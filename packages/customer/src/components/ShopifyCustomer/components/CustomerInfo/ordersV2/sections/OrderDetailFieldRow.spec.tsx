import { render } from '@repo/testing/vitest'
import { DateFormatType, TimeFormatType } from '@repo/utils'
import { screen } from '@testing-library/react'

import type {
    ComponentOrderFieldConfig,
    OrderFieldRenderContext,
    ReadOnlyOrderFieldConfig,
} from '../../types'
import { OrderDetailFieldRow } from './OrderDetailFieldRow'

vi.mock('@repo/hooks', async (importOriginal) => ({
    ...((await importOriginal()) as Record<string, unknown>),
    useCopyToClipboard: () => [
        {},
        (text: string) => navigator.clipboard.writeText(text),
    ],
}))

const baseContext: OrderFieldRenderContext = {
    order: { id: 1 },
    isDraftOrder: false,
    integrationId: 1,
    ticketId: 'ticket-1',
    storeName: 'My Store',
    dateFormat: DateFormatType.en_US,
    timeFormat: TimeFormatType.AmPm,
    timezone: undefined,
}

describe('OrderDetailFieldRow', () => {
    describe('readonly field', () => {
        const readonlyField: ReadOnlyOrderFieldConfig = {
            id: 'order_id',
            type: 'readonly',
            label: 'Order ID',
            getValue: () => 12345,
        }

        it('renders label and value', () => {
            render(
                <OrderDetailFieldRow
                    field={readonlyField}
                    context={baseContext}
                />,
            )

            expect(screen.getByText('Order ID')).toBeInTheDocument()
            expect(screen.getByText('12345')).toBeInTheDocument()
        })

        it('renders nothing when value is null', () => {
            const field: ReadOnlyOrderFieldConfig = {
                ...readonlyField,
                getValue: () => undefined,
            }

            const { container } = render(
                <OrderDetailFieldRow field={field} context={baseContext} />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('renders a copy button when copyable is true', () => {
            const field: ReadOnlyOrderFieldConfig = {
                ...readonlyField,
                copyable: true,
            }

            render(<OrderDetailFieldRow field={field} context={baseContext} />)

            expect(
                screen.getByRole('button', { name: /copy order id/i }),
            ).toBeInTheDocument()
        })

        it('does not render a copy button when copyable is false', () => {
            render(
                <OrderDetailFieldRow
                    field={readonlyField}
                    context={baseContext}
                />,
            )

            expect(
                screen.queryByRole('button', { name: /copy order id/i }),
            ).not.toBeInTheDocument()
        })

        it('uses formatValue when provided', () => {
            const field: ReadOnlyOrderFieldConfig = {
                ...readonlyField,
                formatValue: (value) => `#${value}`,
            }

            render(<OrderDetailFieldRow field={field} context={baseContext} />)

            expect(screen.getByText('#12345')).toBeInTheDocument()
        })
    })

    describe('component field', () => {
        const componentField: ComponentOrderFieldConfig = {
            id: 'note',
            type: 'component',
            label: 'Note',
            getValue: () => 'Handle with care',
            render: () => <span>Handle with care</span>,
        }

        it('renders label and component output', () => {
            render(
                <OrderDetailFieldRow
                    field={componentField}
                    context={baseContext}
                />,
            )

            expect(screen.getByText('Note')).toBeInTheDocument()
            expect(screen.getByText('Handle with care')).toBeInTheDocument()
        })

        it('renders nothing when render returns null', () => {
            const field: ComponentOrderFieldConfig = {
                ...componentField,
                render: () => null,
            }

            const { container } = render(
                <OrderDetailFieldRow field={field} context={baseContext} />,
            )

            expect(container).toBeEmptyDOMElement()
        })

        it('renders a copy button when copyable is true', () => {
            const field: ComponentOrderFieldConfig = {
                ...componentField,
                copyable: true,
                copyValue: () => 'Handle with care',
            }

            render(<OrderDetailFieldRow field={field} context={baseContext} />)

            expect(
                screen.getByRole('button', { name: /copy note/i }),
            ).toBeInTheDocument()
        })

        it('renders a URL link when isUrlField is true and value is a URL', () => {
            const url = 'https://shop.example.com/orders/1/invoice'
            const field: ComponentOrderFieldConfig = {
                ...componentField,
                id: 'invoice_url',
                label: 'Invoice URL',
                getValue: () => url,
                render: () => <span>{url}</span>,
            }

            render(
                <OrderDetailFieldRow
                    field={field}
                    context={baseContext}
                    isUrlField
                />,
            )

            const link = screen.getByRole('link', { name: url })
            expect(link).toHaveAttribute('href', url)
            expect(link).toHaveAttribute('target', '_blank')
        })

        it('falls back to field.render when isUrlField is true but value is empty', () => {
            const field: ComponentOrderFieldConfig = {
                ...componentField,
                id: 'invoice_url',
                label: 'Invoice URL',
                getValue: () => undefined,
                render: () => <span>No URL</span>,
            }

            render(
                <OrderDetailFieldRow
                    field={field}
                    context={baseContext}
                    isUrlField
                />,
            )

            expect(screen.getByText('No URL')).toBeInTheDocument()
            expect(screen.queryByRole('link')).not.toBeInTheDocument()
        })
    })
})

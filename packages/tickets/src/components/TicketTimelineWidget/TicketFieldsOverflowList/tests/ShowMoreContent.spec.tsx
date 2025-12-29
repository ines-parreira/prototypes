import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { TicketCustomField } from '../../types'
import { ShowMoreContent } from '../ShowMoreContent'

describe('ShowMoreContent', () => {
    it('should render hidden fields with labels and values', () => {
        const hiddenFields: TicketCustomField[] = [
            {
                id: 1,
                label: 'Priority',
                value: 'high',
                shortValueLabel: 'High',
            },
            {
                id: 2,
                label: 'Category',
                value: 'technical',
                shortValueLabel: 'Technical',
            },
        ]

        render(<ShowMoreContent hiddenFields={hiddenFields} />)

        expect(screen.getByText('Priority:')).toBeInTheDocument()
        expect(screen.getByText('High')).toBeInTheDocument()
        expect(screen.getByText('Category:')).toBeInTheDocument()
        expect(screen.getByText('Technical')).toBeInTheDocument()
    })

    it('should render empty list when no hidden fields', () => {
        const { container } = render(<ShowMoreContent hiddenFields={[]} />)

        const list = container.querySelector('ul')
        expect(list).toBeInTheDocument()
        expect(list?.children).toHaveLength(0)
    })

    it('should render multiple hidden fields', () => {
        const hiddenFields: TicketCustomField[] = [
            {
                id: 1,
                label: 'Field 1',
                value: 'value1',
                shortValueLabel: 'Value 1',
            },
            {
                id: 2,
                label: 'Field 2',
                value: 'value2',
                shortValueLabel: 'Value 2',
            },
            {
                id: 3,
                label: 'Field 3',
                value: 'value3',
                shortValueLabel: 'Value 3',
            },
        ]

        const { container } = render(
            <ShowMoreContent hiddenFields={hiddenFields} />,
        )

        const listItems = container.querySelectorAll('li')
        expect(listItems).toHaveLength(3)
    })

    it('should display shortValueLabel instead of raw value', () => {
        const hiddenFields: TicketCustomField[] = [
            {
                id: 1,
                label: 'Status',
                value: 'in_progress',
                shortValueLabel: 'In Progress',
            },
        ]

        render(<ShowMoreContent hiddenFields={hiddenFields} />)

        expect(screen.getByText('Status:')).toBeInTheDocument()
        expect(screen.getByText('In Progress')).toBeInTheDocument()
        expect(screen.queryByText('in_progress')).not.toBeInTheDocument()
    })
})

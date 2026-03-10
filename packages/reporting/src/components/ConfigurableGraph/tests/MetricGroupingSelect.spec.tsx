import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

import { MetricGroupingSelect } from '../components/MetricGroupingSelect'

const items = [
    { id: 'by_feature', name: 'Feature' },
    { id: 'by_channel', name: 'Channel' },
]

describe('MetricGroupingSelect', () => {
    it('renders a button showing the selected item label', () => {
        render(
            <MetricGroupingSelect
                items={items}
                selectedItem={items[0]}
                onMetricGroupingSelect={vi.fn()}
            />,
        )

        expect(
            screen.getByRole('button', { name: /Feature/i }),
        ).toBeInTheDocument()
    })

    it('calls onMetricGroupingSelect with the item when an option is selected', async () => {
        const user = userEvent.setup()
        const onSelect = vi.fn()

        render(
            <MetricGroupingSelect
                items={items}
                selectedItem={items[0]}
                onMetricGroupingSelect={onSelect}
            />,
        )

        await user.click(screen.getByRole('button', { name: /Feature/i }))

        const channelElements = screen.getAllByText('Channel')
        const visualItem = channelElements.find(
            (el) => el.tagName !== 'OPTION',
        )!
        await user.click(visualItem)

        expect(onSelect).toHaveBeenCalledWith(items[1])
    })
})

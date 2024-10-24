import {act, render, screen} from '@testing-library/react'

import userEvent from '@testing-library/user-event'
import React from 'react'

import {
    ChatWorkload,
    EmailWorkload,
    InstagramWorkload,
    PhoneWorkload,
} from 'fixtures/chart'

import GaugeChart from '../GaugeChart'

describe('<GaugeChart />', () => {
    it('should render the gauge chart', () => {
        const {container} = render(
            <GaugeChart
                data={[
                    ChatWorkload,
                    EmailWorkload,
                    InstagramWorkload,
                    PhoneWorkload,
                    {
                        label: 'Foo workload',
                        value: 1000,
                    },
                    {
                        label: 'Bar workload',
                        value: 1,
                    },
                ]}
            />
        )

        expect(container).toMatchSnapshot()
    })

    it('should have segment tooltip', async () => {
        const chartItem = {
            label: 'Foo workload',
            value: 1000,
        }

        render(<GaugeChart data={[chartItem]} />)
        act(() => {
            userEvent.hover(screen.getByTitle(chartItem.label))
        })

        expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    })

    it('should render no available data text on empty data', async () => {
        render(<GaugeChart data={[]} />)

        expect(
            await screen.findByText(/no data available/i)
        ).toBeInTheDocument()
    })
})

import React from 'react'
import {render} from '@testing-library/react'

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
})

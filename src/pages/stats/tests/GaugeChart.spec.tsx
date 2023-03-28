import React from 'react'
import {render} from '@testing-library/react'

import {ChatWorkload, EmailWorkload} from 'fixtures/chart'
import GaugeChart from '../GaugeChart'

describe('<GaugeChart />', () => {
    it('should render the gauge chart', () => {
        const {container} = render(
            <GaugeChart data={[ChatWorkload, EmailWorkload]} />
        )

        expect(container).toMatchSnapshot()
    })
})

import type { ComponentProps } from 'react'
import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'

import {
    stats as statsConfig,
    SUPPORT_VOLUME,
} from 'domains/reporting/config/stats'
import BarStat from 'domains/reporting/pages/common/components/charts/BarStat'

const minProps: ComponentProps<typeof BarStat> = {
    data: fromJS({
        axes: {
            x: [123434533, 123435636, 123456568, 123876542],
            y: [],
        },
        lines: [
            {
                name: 'created',
                data: [23, 4, 445, 56],
            },
            {
                name: 'closed',
                data: [65, 45, 87, 9],
            },
        ],
    }),
    config: fromJS({}),
    legend: fromJS({
        axes: {
            x: 'created',
            y: 'closed',
        },
    }),
}

const minPropsNoData: ComponentProps<typeof BarStat> = {
    ...minProps,
    data: fromJS({
        lines: [],
    }),
}

describe('BarStat', () => {
    it('should render a bar chart', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)

        const { container } = render(<BarStat {...minProps} config={config} />)

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should render a bar chart with "no data" message', () => {
        const config = statsConfig.find((config, key) => key === SUPPORT_VOLUME)

        const { container } = render(
            <BarStat {...minPropsNoData} config={config} />,
        )

        expect(container.firstChild).toMatchSnapshot()
    })
})

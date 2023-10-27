require('@storybook/addon-console')

require('assets/css/main.less')

import {
    BarElement,
    BarController,
    Chart,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    Filler,
    ArcElement,
} from 'chart.js'
import {SankeyController, Flow} from 'chartjs-chart-sankey'

export const parameters = {
    chromatic: {disableSnapshot: true},
    viewMode: 'docs',
    docs: {
        canvas: {sourceState: 'shown'},
    },
    options: {
        storySort: {
            order: [
                'Docs Overview',
                'Design System',
                'General',
                'Navigation',
                'Data Entry',
                'Data Display',
                'Feedback',
                'Layout',
            ],
            method: 'alphabetical',
        },
    },
    backgrounds: {
        default: 'light',
        values: [
            {
                name: 'light',
                value: '#fff',
            },
            {
                name: 'grey',
                value: '#eee',
            },
            {
                name: 'dark',
                value: '#333',
            },
        ],
    },
}

Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
    Legend,
    LinearScale,
    CategoryScale,
    SankeyController,
    Flow,
    Filler,
    ArcElement
)

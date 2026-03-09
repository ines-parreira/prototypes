import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import Shoutout from 'domains/reporting/pages/common/components/Shoutout/Shoutout'
import { personNames } from 'fixtures/personNames'

const storyConfig: Meta<typeof Shoutout> = {
    title: 'Stats/Shoutout',
    component: Shoutout,
    parameters: {
        chromatic: { disableSnapshot: false },
    },
    argTypes: {
        multiplePersonsLabel: {
            control: {
                type: 'text',
            },
        },
        value: {
            control: {
                type: 'text',
            },
        },
        metricName: {
            control: {
                type: 'text',
            },
        },
        persons: {
            control: {
                type: 'object',
            },
        },
    },
}

type Story = StoryObj<typeof Shoutout>

const Template: Story = {
    render: (props) => (
        <div style={{ maxWidth: 280, margin: '0 auto' }}>
            <Shoutout {...props} />
        </div>
    ),
}

export const SinglePerson = {
    ...Template,
    args: {
        metricName: 'Satisfaction score',
        value: '4.76',
        persons: [
            {
                name: 'Alex Gonzales',
            },
        ],
        multiplePersonsLabel: '1 agent', // unnecessary here
    },
}

export const MultiplePersons = {
    ...Template,
    args: {
        metricName: 'First response time',
        value: '4.25m',
        persons: getPersonList(4),
        multiplePersonsLabel: `4 agents`,
    },
}

export const ExceedingPersons = {
    ...Template,
    args: {
        metricName: 'First response time',
        value: '4.25m',
        persons: getPersonList(),
        multiplePersonsLabel: `${getPersonList().length} agents`,
    },
}

export const NoData = {
    ...Template,
    args: {
        metricName: 'First response time',
        value: null,
        persons: [],
        multiplePersonsLabel: `0 agents`,
    },
}

export default storyConfig

function getPersonList(max = 15) {
    return personNames.map((name) => ({ name })).slice(0, max)
}

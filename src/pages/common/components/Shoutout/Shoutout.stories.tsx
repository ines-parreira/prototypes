import {Meta, Story} from '@storybook/react'
import React, {ComponentProps} from 'react'

import {personNames} from 'fixtures/personNames'

import Shoutout from './Shoutout'

const storyConfig: Meta = {
    title: 'Stats/Shoutout',
    component: Shoutout,
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
                type: 'array',
            },
        },
    },
}

const Template: Story<ComponentProps<typeof Shoutout>> = ({...props}) => (
    <div style={{maxWidth: 280, margin: '0 auto'}}>
        <Shoutout {...props} />
    </div>
)

export const SinglePerson = Template.bind({})
SinglePerson.args = {
    metricName: 'Satisfaction score',
    value: '4.76',
    persons: [
        {
            name: 'Alex Gonzales',
        },
    ],
    multiplePersonsLabel: '1 agent', // unnecessary here
}

export const MultiplePersons = Template.bind({})
MultiplePersons.args = {
    metricName: 'First response time',
    value: '4.25m',
    persons: getPersonList(4),
    multiplePersonsLabel: `4 agents`,
}

export const ExceedingPersons = Template.bind({})
ExceedingPersons.args = {
    metricName: 'First response time',
    value: '4.25m',
    persons: getPersonList(),
    multiplePersonsLabel: `${getPersonList().length} agents`,
}

export const NoData = Template.bind({})
NoData.args = {
    metricName: 'First response time',
    value: null,
    persons: [],
    multiplePersonsLabel: `0 agents`,
}

export default storyConfig

function getPersonList(max = 15) {
    return personNames.map((name) => ({name})).slice(0, max)
}

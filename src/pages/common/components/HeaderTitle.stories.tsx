import React, {ComponentProps} from 'react'
import {Meta, Story} from '@storybook/react'

import HeaderTitle from 'pages/common/components/HeaderTitle'

const storyConfig: Meta = {
    title: 'General/Layout/HeaderTitle',
    component: HeaderTitle,
    argTypes: {
        description: {
            control: {
                type: 'text',
            },
        },
        helpUrl: {
            control: {
                type: 'text',
            },
        },
        title: {
            control: {
                type: 'text',
            },
        },
    },
}

const defaultProps: ComponentProps<typeof HeaderTitle> = {
    description:
        'Proserpina is an ancient Roman goddess whose cult, myths and mysteries were combined from those of Libera, an early Roman goddess of wine. In Greek she is known as Persephone and her mother is Demeter, goddesses of grain and agriculture.',
    helpUrl: 'https://en.wikipedia.org/wiki/The_Rape_of_Proserpina',
    title: 'Fun Roman fact!',
}

const templateParameters = {
    controls: {
        include: ['description', 'helpUrl', 'title'],
    },
}

const Template: Story<ComponentProps<typeof HeaderTitle>> = (props) => (
    <HeaderTitle {...props} />
)

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig

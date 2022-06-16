import React from 'react'
import {Meta, Story} from '@storybook/react'

import VisibilityCell, {VisibilityCellProps} from './VisibilityCell'

const storyConfig: Meta = {
    title: 'Help Center/VisibilityCell',
    component: VisibilityCell,
    argTypes: {
        status: {
            options: ['Public', 'Unlisted'],
            mapping: {
                ['Public']: 'PUBLIC',
                ['Unlisted']: 'UNLISTED',
            },
        },
    },
}

const Template: Story<VisibilityCellProps> = ({status}) => {
    return <VisibilityCell status={status} />
}

const defaultProps: Partial<VisibilityCellProps> = {
    status: 'PUBLIC',
}

const templateParameters = {
    controls: {
        include: ['status'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig

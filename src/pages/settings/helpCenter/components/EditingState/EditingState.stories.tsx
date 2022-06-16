import React from 'react'
import {Meta, Story} from '@storybook/react'

import {EditingStateEnum} from '../../constants'

import EditingState, {EditingStateProps} from './EditingState'

const storyConfig: Meta = {
    title: 'Help Center/EditingState',
    component: EditingState,
    argTypes: {
        status: {
            options: ['Published', 'Unsaved', 'Saved'],
            mapping: {
                ['Published']: EditingStateEnum.PUBLISHED,
                ['Unsaved']: EditingStateEnum.UNSAVED,
                ['Saved']: EditingStateEnum.SAVED,
            },
        },
    },
}

const Template: Story<EditingStateProps> = ({state}) => {
    return <EditingState state={state} />
}

const defaultProps: Partial<EditingStateProps> = {
    state: EditingStateEnum.PUBLISHED,
}

const templateParameters = {
    controls: {
        include: ['state'],
    },
}

export const Default = Template.bind({})
Default.args = defaultProps
Default.parameters = templateParameters

export default storyConfig

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import { EditingStateEnum } from '../../constants'
import type { EditingStateProps } from './EditingState'
import EditingState from './EditingState'

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

type Story = StoryObj<typeof EditingState>

const Template: Story = {
    render: ({ state }) => <EditingState state={state} />,
}

const defaultProps: Partial<EditingStateProps> = {
    state: EditingStateEnum.PUBLISHED,
}

const templateParameters = {
    controls: {
        include: ['state'],
    },
}

export const Default = {
    ...Template,
    args: defaultProps,
    parameters: templateParameters,
}

export default storyConfig

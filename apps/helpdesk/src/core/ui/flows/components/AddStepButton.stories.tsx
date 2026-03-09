import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { AddStepButton } from './AddStepButton'
import { AddStepMenuItem } from './AddStepMenuItem'

const meta = {
    title: 'Common/Flows/AddStepButton',
    component: AddStepButton,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        children: {
            description: 'AddStepMenuItem components',
        },
        isDisabled: {
            control: 'boolean',
            description: 'Whether the button is disabled',
        },
    },
} satisfies Meta<typeof AddStepButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: (args) => (
        <AddStepButton {...args}>
            <AddStepMenuItem
                label="Add Step"
                onClick={() => action('Add Step clicked')()}
            />
            <AddStepMenuItem
                label="Add Condition"
                onClick={() => action('Add Condition clicked')()}
            />
            <AddStepMenuItem
                label="Add Action"
                onClick={() => action('Add Action clicked')()}
            />
        </AddStepButton>
    ),
}

export const WithIcons: Story = {
    render: (args) => (
        <AddStepButton {...args}>
            <AddStepMenuItem
                label="Add Note"
                icon={
                    <i className="material-icons" style={{ fontSize: '16px' }}>
                        note_add
                    </i>
                }
                onClick={() => action('Add Note clicked')()}
            />
            <AddStepMenuItem
                label="Add Branch"
                icon={
                    <i className="material-icons" style={{ fontSize: '16px' }}>
                        call_split
                    </i>
                }
                onClick={() => action('Add Branch clicked')()}
            />
            <AddStepMenuItem
                label="Add Configuration"
                icon={
                    <i className="material-icons" style={{ fontSize: '16px' }}>
                        settings
                    </i>
                }
                onClick={() => action('Add Configuration clicked')()}
            />
        </AddStepButton>
    ),
}

export const MixedContent: Story = {
    render: (args) => (
        <AddStepButton {...args}>
            <div
                style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    color: '#666',
                    borderBottom: '1px solid #e5e5e5',
                }}
            >
                Choose an action:
            </div>
            <AddStepMenuItem
                label="Option 1"
                icon={
                    <i className="material-icons" style={{ fontSize: '16px' }}>
                        star
                    </i>
                }
                onClick={() => action('Option 1 clicked')()}
            />
            <AddStepMenuItem
                label="Option 2"
                onClick={() => action('Option 2 clicked')()}
            />
        </AddStepButton>
    ),
}

export const Disabled: Story = {
    args: {
        isDisabled: true,
    },
    render: (args) => (
        <AddStepButton {...args}>
            <AddStepMenuItem
                label="Add Step"
                onClick={() => action('Add Step clicked')()}
            />
            <AddStepMenuItem
                label="Add Condition"
                onClick={() => action('Add Condition clicked')()}
            />
            <AddStepMenuItem
                label="Add Action"
                onClick={() => action('Add Action clicked')()}
            />
        </AddStepButton>
    ),
}

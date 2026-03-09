import type { Meta, StoryObj } from 'storybook-react-rsbuild'
import { action } from 'storybook/actions'

import { StepCardActionMenu } from './StepCardActionMenu'
import { StepCardActionMenuItem } from './StepCardActionMenuItem'

const meta: Meta<typeof StepCardActionMenu> = {
    title: 'Common/Flows/StepCardActionMenu',
    component: StepCardActionMenu,
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story) => (
            <div
                style={{
                    height: '50px',
                    width: '50px',
                    position: 'relative',
                }}
            >
                <Story />
            </div>
        ),
    ],
    argTypes: {
        children: {
            description: 'StepCardActionMenuItem components',
        },
    },
}

export default meta

type Story = StoryObj<typeof StepCardActionMenu>

export const BasicMenu: Story = {
    render: () => (
        <StepCardActionMenu>
            <StepCardActionMenuItem
                label="Edit"
                onClick={() => action('Edit clicked')()}
            />
            <StepCardActionMenuItem
                label="Delete"
                onClick={() => action('Delete clicked')()}
            />
        </StepCardActionMenu>
    ),
}

export const WithIcons: Story = {
    render: () => (
        <StepCardActionMenu>
            <StepCardActionMenuItem
                label="Edit"
                icon={<i className="material-icons">edit</i>}
                onClick={() => action('Edit clicked')()}
            />
            <StepCardActionMenuItem
                label="Duplicate"
                icon={<i className="material-icons">content_copy</i>}
                onClick={() => action('Duplicate clicked')()}
            />
            <StepCardActionMenuItem
                label="Delete"
                icon={<i className="material-icons">delete</i>}
                onClick={() => action('Delete clicked')()}
            />
        </StepCardActionMenu>
    ),
}

export const CustomStyledItems: Story = {
    render: () => (
        <StepCardActionMenu>
            <StepCardActionMenuItem
                label="Edit"
                icon={<i className="material-icons">edit</i>}
                className="custom-edit-item"
                onClick={() => action('Edit clicked')()}
            />
            <StepCardActionMenuItem
                label="Delete"
                icon={
                    <i className="material-icons" style={{ color: '#ef4444' }}>
                        delete
                    </i>
                }
                className="custom-delete-item"
                onClick={() => action('Delete clicked')()}
            />
        </StepCardActionMenu>
    ),
}

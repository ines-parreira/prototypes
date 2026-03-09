import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import {
    StaticVerticalStep,
    StaticVerticalStepper,
} from './StaticVerticalStepper'

const meta = {
    title: 'Common/Forms/StaticVerticalStepper',
    component: StaticVerticalStepper,
    parameters: {
        layout: 'centered',
    },
    argTypes: {
        children: {
            description: 'StaticVerticalStep components',
        },
    },
} satisfies Meta<typeof StaticVerticalStepper>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
    render: () => (
        <StaticVerticalStepper>
            <StaticVerticalStep stepDescription="Step 1: Initialize">
                Initialize the application with default settings.
            </StaticVerticalStep>
            <StaticVerticalStep stepDescription="Step 2: Configure">
                Configure your preferences and user settings.
            </StaticVerticalStep>
            <StaticVerticalStep stepDescription="Step 3: Deploy">
                Deploy your application to production.
            </StaticVerticalStep>
        </StaticVerticalStepper>
    ),
}

export const SingleStep: Story = {
    render: () => (
        <StaticVerticalStepper>
            <StaticVerticalStep stepDescription="Only Step">
                This is the only step in the process.
            </StaticVerticalStep>
        </StaticVerticalStepper>
    ),
}

export const EmptySteps: Story = {
    render: () => <StaticVerticalStepper />,
}

export const WithRichContent: Story = {
    render: () => (
        <StaticVerticalStepper>
            <StaticVerticalStep
                stepDescription={
                    <div>
                        <strong>Step 1</strong>
                        <span style={{ marginLeft: '8px', color: '#666' }}>
                            (Required)
                        </span>
                    </div>
                }
            >
                <div>
                    <p>Complete the following tasks:</p>
                    <ul>
                        <li>Fill out the form</li>
                        <li>Verify your email</li>
                        <li>Set up 2FA</li>
                    </ul>
                </div>
            </StaticVerticalStep>
            <StaticVerticalStep
                stepDescription={
                    <div>
                        <strong>Step 2</strong>
                        <span style={{ marginLeft: '8px', color: '#666' }}>
                            (Optional)
                        </span>
                    </div>
                }
            >
                <div style={{ padding: '10px', backgroundColor: '#f5f5f5' }}>
                    <code>npm install @gorgias/axiom</code>
                    <p style={{ marginTop: '10px' }}>
                        Install the required dependencies for your project.
                    </p>
                </div>
            </StaticVerticalStep>
            <StaticVerticalStep stepDescription="Step 3: Finalize">
                <button
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                    }}
                    onClick={() => alert('Process completed!')}
                >
                    Complete Process
                </button>
            </StaticVerticalStep>
        </StaticVerticalStepper>
    ),
}

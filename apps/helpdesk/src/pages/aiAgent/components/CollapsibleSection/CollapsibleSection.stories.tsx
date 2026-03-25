import { useState } from 'react'

import type { Meta, StoryObj } from 'storybook-react-rsbuild'

import CollapsibleSection from './CollapsibleSection'

const storyConfig: Meta<typeof CollapsibleSection> = {
    title: 'AI Agent/Components/CollapsibleSection',
    component: CollapsibleSection,
    argTypes: {
        title: {
            control: 'text',
            description: 'The title displayed in the header',
        },
        caption: {
            control: 'text',
            description: 'Optional caption text displayed below the title',
        },
        isExpanded: {
            control: 'boolean',
            description: 'Whether the section is expanded or collapsed',
        },
        onToggle: {
            action: 'toggled',
            description: 'Callback function when the section is toggled',
        },
    },
}

type Story = StoryObj<typeof CollapsibleSection>

const ControlledCollapsibleSection = (
    args: Omit<React.ComponentProps<typeof CollapsibleSection>, 'onToggle'>,
) => {
    const [isExpanded, setIsExpanded] = useState(args.isExpanded)

    return (
        <CollapsibleSection
            {...args}
            isExpanded={isExpanded}
            onToggle={() => setIsExpanded(!isExpanded)}
        />
    )
}

export const Expanded: Story = {
    render: (args) => <ControlledCollapsibleSection {...args} />,
    args: {
        title: 'Header',
        isExpanded: true,
        children: (
            <div
                style={{
                    marginTop: '12px',
                    backgroundColor: 'yellow',
                    height: '120px',
                    borderRadius: '4px',
                }}
            >
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    This content is visible when expanded
                </div>
            </div>
        ),
    },
}

export const Collapsed: Story = {
    render: (args) => <ControlledCollapsibleSection {...args} />,
    args: {
        title: 'Header',
        isExpanded: false,
        children: (
            <div>
                <p>This content is hidden when collapsed</p>
            </div>
        ),
    },
}

export const WithSimpleContent: Story = {
    render: (args) => <ControlledCollapsibleSection {...args} />,
    args: {
        title: 'Settings',
        isExpanded: true,
        children: (
            <div>
                <p style={{ margin: 0 }}>
                    This is a simple collapsible section with basic text
                    content.
                </p>
            </div>
        ),
    },
}

export const WithListContent: Story = {
    render: (args) => <ControlledCollapsibleSection {...args} />,
    args: {
        title: 'Features',
        isExpanded: true,
        children: (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Automatic ticket routing</li>
                <li>Smart response suggestions</li>
                <li>Multi-language support</li>
                <li>Performance analytics</li>
            </ul>
        ),
    },
}

export const WithCaption: Story = {
    render: (args) => <ControlledCollapsibleSection {...args} />,
    args: {
        title: 'Advanced Settings',
        caption: 'Configure advanced options for your AI agent',
        isExpanded: true,
        children: (
            <div>
                <p style={{ margin: 0 }}>
                    This section demonstrates the optional caption feature that
                    provides additional context about the section.
                </p>
            </div>
        ),
    },
}

const MultipleSectionsComponent = () => {
    const [expandedSections, setExpandedSections] = useState<
        Record<string, boolean>
    >({
        Header: true,
        channels: false,
        knowledge: false,
    })

    const toggleSection = (section: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
            }}
        >
            <CollapsibleSection
                title="Header"
                isExpanded={expandedSections.Header}
                onToggle={() => toggleSection('Header')}
            >
                <p style={{ margin: 0 }}>
                    Choose a Header that fits your brand or create your own.
                </p>
            </CollapsibleSection>
            <CollapsibleSection
                title="Channels"
                isExpanded={expandedSections.channels}
                onToggle={() => toggleSection('channels')}
            >
                <p style={{ margin: 0 }}>
                    Select the channels where your AI agent will be active.
                </p>
            </CollapsibleSection>
            <CollapsibleSection
                title="Knowledge Base"
                isExpanded={expandedSections.knowledge}
                onToggle={() => toggleSection('knowledge')}
            >
                <p style={{ margin: 0 }}>
                    Configure your AI agent&apos;s knowledge sources.
                </p>
            </CollapsibleSection>
        </div>
    )
}

export const MultipleSections: Story = {
    render: () => <MultipleSectionsComponent />,
}

export default storyConfig

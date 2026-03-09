import type { ComponentProps } from 'react'

import type { Meta, StoryFn } from 'storybook-react-rsbuild'

import { SmsChannelMessagesContainer } from './SmsChannelMessagesContainer'

const storyConfig: Meta = {
    title: 'AI Agent/PlaygroundV2/SmsChannelMessagesContainer',
    component: SmsChannelMessagesContainer,
    argTypes: {
        children: {
            description: 'The content to display inside the SMS container',
            control: { type: 'text' },
        },
        storeName: {
            description: 'The store name to display in the header',
            control: { type: 'text' },
        },
    },
}

const defaultProps: ComponentProps<typeof SmsChannelMessagesContainer> = {
    storeName: 'Test Store',
    children: (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                Hello! How can I help you today?
            </div>
            <div
                style={{
                    backgroundColor: '#E5E5EA',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                }}
            >
                Hi! I need help with my order #12345
            </div>
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                Of course! Let me look that up for you. Can you tell me what
                issue you&apos;re experiencing?
            </div>
            <div
                style={{
                    backgroundColor: '#E5E5EA',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                }}
            >
                I ordered a blue sweater but received a red one instead
            </div>
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                I apologize for the mix-up! I&apos;d be happy to help you
                exchange that for the correct color.
            </div>
            <div
                style={{
                    backgroundColor: '#E5E5EA',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                }}
            >
                Thank you! Do I need to return the red one first?
            </div>
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                No need! I&apos;ll send you the blue sweater right away and you
                can return the red one when it&apos;s convenient.
            </div>
            <div
                style={{
                    backgroundColor: '#E5E5EA',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                }}
            >
                Perfect! When can I expect the blue one?
            </div>
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                It should arrive within 3-5 business days. I&apos;ll email you
                the tracking information shortly!
            </div>
            <div
                style={{
                    backgroundColor: '#E5E5EA',
                    color: 'black',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    marginBottom: '10px',
                    maxWidth: '70%',
                }}
            >
                Great, thank you so much for your help!
            </div>
            <div
                style={{
                    backgroundColor: '#007AFF',
                    color: 'white',
                    padding: '10px 15px',
                    borderRadius: '18px',
                    maxWidth: '70%',
                    alignSelf: 'flex-end',
                    marginLeft: 'auto',
                }}
            >
                You&apos;re welcome! Is there anything else I can help you with
                today?
            </div>
        </div>
    ),
}

const Template: StoryFn<ComponentProps<typeof SmsChannelMessagesContainer>> = (
    args,
) => {
    return <SmsChannelMessagesContainer {...args} />
}

export const Default = Template.bind({})
Default.args = { ...defaultProps }

export const Empty = Template.bind({})
Empty.args = {
    children: <div style={{ textAlign: 'center' }}>No messages yet</div>,
}

export default storyConfig

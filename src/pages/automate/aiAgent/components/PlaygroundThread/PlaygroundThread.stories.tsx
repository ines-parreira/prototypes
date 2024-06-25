import React from 'react'
import {Meta, StoryObj} from '@storybook/react'
import Button from 'pages/common/components/button/Button'
import {MessageType, TicketOutcome} from 'models/aiAgentPlayground/types'
import PlaygroundMessage from '../PlaygroundMessage/PlaygroundMessage'
import TicketEvent from '../TicketEvent/TicketEvent'
import PlaygroundThread from './PlaygroundThread'

const meta: Meta<typeof PlaygroundThread> = {
    title: 'AI Agent/Playground/Thread',
    component: PlaygroundThread,
    argTypes: {
        subject: {
            control: {
                type: 'text',
            },
        },
        threadContent: {
            control: {
                type: 'object',
            },
        },
        actions: {
            control: {
                type: 'object',
            },
        },
    },
}

export default meta

type Story = StoryObj<typeof PlaygroundThread>

const AIAgentMessage = `Hi Leslie, \nThank you for reaching out about your order #464936927. I understand you've received two of the T-shirts but are still waiting on the third one. I've checked the status of your order and can confirm that the missing T-shirt, the KIDS ARVIN GRAPHIC TEE in black/size XXS/4, was shipped separately as package #4658369.\nThe package status is currently marked as 'In Transit', and it has a tracking number 1ZW5X3658563836599. You can follow its journey via the tracking link here: https://www.ups.com/WebTracking?loc=en_US&requester=ST&trackNums=1ZW5X3658563836599. Your order date was on April 7, 2024, and since the current date is April 10, 2024, it has not yet exceeded 7 days from the order date. Usually, we recommend allowing up to two additional days for the package to be delivered, as there can be unexpected delays.\nIf your package doesn’t arrive within this time frame, please get back to us, and we will take further action. In the meantime, you can check the status of your order using the following link: https://psychobunny-com.gorgias.help/en-US/ssp/orders.\nAlso, it's not uncommon for items to be delivered in separate packages and on different days, depending on how they are processed and shipped.\nRest assured, we'll keep an eye on this for you, and should you need any more information or assistance, feel free to reach out.`

const InternalNote = `The AI Agent didn't generate a response and closed the ticket.\nHow did it do? 👍 Good 👎 Bad\nThe AI Agent found no relevant information to resolve this ticket. You can create a Help Center article to cover this topic.`

export const AIAgentLoading: Story = {
    render: (args) => <PlaygroundThread {...args} />,
    args: {
        threadContent: (
            <div>
                <PlaygroundMessage
                    sender={'John Doe'}
                    type={MessageType.MESSAGE}
                    message={'I want a refund, please'}
                />
                <PlaygroundMessage
                    sender={'AI Agent'}
                    type={MessageType.MESSAGE}
                />
            </div>
        ),
    },
}

export const WithSubject: Story = {
    render: (args) => <PlaygroundThread {...args} />,
    args: {
        subject: 'Cancel order',
        threadContent: (
            <div>
                <PlaygroundMessage
                    sender={'John Doe'}
                    type={MessageType.MESSAGE}
                    message={'I want a refund, please'}
                />
                <PlaygroundMessage
                    sender={'AI Agent'}
                    type={MessageType.MESSAGE}
                    message={AIAgentMessage}
                />
                <PlaygroundMessage
                    sender={'AI Agent'}
                    type={MessageType.INTERNAL_NOTE}
                    message={InternalNote}
                />
                <TicketEvent type={TicketOutcome.CLOSE} />
            </div>
        ),
        actions: (
            <div>
                <Button onClick={() => {}} intent="primary">
                    Reset
                </Button>
            </div>
        ),
    },
}

export const WithoutSubject: Story = {
    render: (args) => <PlaygroundThread {...args} />,
    args: {
        threadContent: (
            <div>
                <PlaygroundMessage
                    sender={'John Doe'}
                    type={MessageType.MESSAGE}
                    message={'I want a refund, please'}
                />
            </div>
        ),
    },
}

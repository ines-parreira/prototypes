import { screen, waitFor } from '@testing-library/react'

import {
    edgeHelpers,
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<WorkflowVisualBuilder />', () => {
    describe('Basic workflow rendering', () => {
        it('should display mini map', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [nodeHelpers.message()],
            })

            expect(screen.getByText('Mini Map')).toBeInTheDocument()
        })
        it('should render template preview with simple scaffolding', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('entrypoint', 'trigger_button1'),
                    nodeHelpers.message('Hello World', 'message1'),
                    nodeHelpers.end('ask-for-feedback', 'end1'),
                ],
                edges: [
                    edgeHelpers.simple('trigger_button1', 'message1'),
                    edgeHelpers.simple('message1', 'end1'),
                ],
            })

            expect(screen.getByText('entrypoint')).toBeInTheDocument()
        })

        it('renders a simple linear workflow', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('Start Conversation', 'trigger'),
                    nodeHelpers.message('Welcome to our support!', 'welcome'),
                    nodeHelpers.message('How can I help you today?', 'help'),
                    nodeHelpers.end('end', 'end'),
                ],
                edges: [
                    edgeHelpers.simple('trigger', 'welcome'),
                    edgeHelpers.simple('welcome', 'help'),
                    edgeHelpers.simple('help', 'end'),
                ],
            })

            expect(screen.getByText('Start Conversation')).toBeInTheDocument()
            expect(
                screen.getByText('Welcome to our support!'),
            ).toBeInTheDocument()
            expect(
                screen.getByText('How can I help you today?'),
            ).toBeInTheDocument()
        })
    })

    describe('Choice-based workflows', () => {
        it('should render workflow with multiple choices', () => {
            const { getByText } = renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('Start', 'trigger'),
                    nodeHelpers.choices(
                        [
                            { label: 'Option 1', event_id: 'opt1' },
                            { label: 'Option 2', event_id: 'opt2' },
                            { label: 'Option 3', event_id: 'opt3' },
                        ],
                        'choices1',
                    ),
                    nodeHelpers.message('You selected option 1', 'msg1'),
                    nodeHelpers.message('You selected option 2', 'msg2'),
                    nodeHelpers.message('You selected option 3', 'msg3'),
                    nodeHelpers.end('ask-for-feedback', 'end1'),
                    nodeHelpers.end('ask-for-feedback', 'end2'),
                    nodeHelpers.end('ask-for-feedback', 'end3'),
                ],
                edges: [
                    edgeHelpers.simple('trigger', 'choices1'),
                    edgeHelpers.withChoiceEvent('choices1', 'msg1', 'opt1'),
                    edgeHelpers.withChoiceEvent('choices1', 'msg2', 'opt2'),
                    edgeHelpers.withChoiceEvent('choices1', 'msg3', 'opt3'),
                    edgeHelpers.simple('msg1', 'end1'),
                    edgeHelpers.simple('msg2', 'end2'),
                    edgeHelpers.simple('msg3', 'end3'),
                ],
            })

            waitFor(() => {
                expect(getByText('Start')).toBeInTheDocument()
                expect(getByText('Choose an option')).toBeInTheDocument()
            })
        })
    })
})

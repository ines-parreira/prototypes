import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<ChannelTriggerNode />', () => {
    describe('Basic rendering', () => {
        it('should render with custom label', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger('Welcome to Support'),
                    nodeHelpers.end(),
                ],
            })

            expect(screen.getByText('Welcome to Support')).toBeInTheDocument()
        })

        it('should display placeholder when label is empty', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [nodeHelpers.channelTrigger(), nodeHelpers.end()],
            })

            expect(screen.getByText('Trigger button')).toBeInTheDocument()
        })
    })
})

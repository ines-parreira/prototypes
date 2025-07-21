import { screen } from '@testing-library/react'

import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<EndNode />', () => {
    describe('Basic rendering', () => {
        it('should render an end node with default action', () => {
            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [nodeHelpers.channelTrigger(), nodeHelpers.end()],
            })

            expect(screen.getByText('end')).toBeInTheDocument()
        })

        it('should render with different end actions', () => {
            const actions: Array<
                | 'ask-for-feedback'
                | 'create-ticket'
                | 'end'
                | 'end-success'
                | 'end-failure'
            > = [
                'ask-for-feedback',
                'create-ticket',
                'end',
                'end-success',
                'end-failure',
            ]

            actions.forEach((action) => {
                const { unmount } = renderVisualBuilder({
                    builderType: 'workflow',
                    nodes: [nodeHelpers.end(action)],
                })

                expect(screen.getByText('end')).toBeInTheDocument()
                unmount()
            })
        })
    })
})

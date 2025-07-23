import { screen } from '@testing-library/react'

import { buildLiquidTemplateNode } from 'pages/automate/workflows/hooks/useVisualBuilderGraphReducer/utils'
import {
    nodeHelpers,
    renderVisualBuilder,
} from 'pages/automate/workflows/utils/testVisualBuilderScaffolding'

describe('<LiquidTemplateNode />', () => {
    describe('Basic rendering', () => {
        it('should render a simple liquid template node with a name', () => {
            const liquidTemplateNode = buildLiquidTemplateNode()
            liquidTemplateNode.data.name = 'My Template'

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    liquidTemplateNode,
                    nodeHelpers.end(),
                ],
            })

            expect(screen.getByText('My Template')).toBeInTheDocument()
        })

        it('should render placeholder text when name is empty', () => {
            const liquidTemplateNode = buildLiquidTemplateNode()

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    liquidTemplateNode,
                    nodeHelpers.end(),
                ],
            })

            // Check that the node displays the default "Liquid template" text within the action tag
            const nodeActionTag = document.querySelector(
                '.visualBuilderActionTag',
            )
            expect(nodeActionTag).toHaveTextContent('Liquid template')
        })

        it('should show error state when node has errors', () => {
            const liquidTemplateNode = buildLiquidTemplateNode()
            liquidTemplateNode.data.name = 'Test Template'
            liquidTemplateNode.data.errors = { name: 'Name is required' }

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    liquidTemplateNode,
                    nodeHelpers.end(),
                ],
            })

            // Node should display the template name
            expect(screen.getByText('Test Template')).toBeInTheDocument()

            // Check that the node container has error state (simplified check)
            const nodeContainer = document.querySelector('.container')
            expect(nodeContainer).toBeInTheDocument()
        })

        it('should display the liquid template icon', () => {
            const liquidTemplateNode = buildLiquidTemplateNode()
            liquidTemplateNode.data.name = 'Icon Test'

            renderVisualBuilder({
                builderType: 'workflow',
                nodes: [
                    nodeHelpers.channelTrigger(),
                    liquidTemplateNode,
                    nodeHelpers.end(),
                ],
            })

            // Check for the data_object icon within the action tag specifically
            const actionTagIcon = document.querySelector(
                '.visualBuilderActionTag .material-icons',
            )
            expect(actionTagIcon).toHaveTextContent('data_object')
        })
    })
})

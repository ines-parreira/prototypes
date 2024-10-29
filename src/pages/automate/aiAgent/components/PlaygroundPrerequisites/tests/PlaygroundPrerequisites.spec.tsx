import {render, screen} from '@testing-library/react'
import React, {ComponentProps} from 'react'

import {getStoreConfigurationFixture} from 'pages/automate/aiAgent/fixtures/storeConfiguration.fixtures'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'

import {CheckPlaygroundPrerequisites} from '../PlaygroundPrerequisites'

jest.mock('pages/automate/aiAgent/hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))

const mockUsePublicResources = jest.mocked(usePublicResources)

const renderComponent = (
    props?: Partial<ComponentProps<typeof CheckPlaygroundPrerequisites>>
) => {
    return render(
        <CheckPlaygroundPrerequisites shopName="it-shop" {...props}>
            <div>Child Component</div>
        </CheckPlaygroundPrerequisites>
    )
}

describe('CheckPlaygroundPrerequisites', () => {
    beforeEach(() => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: false,
        })
    })

    it('renders MissingKnowledgeSourceAlert when storeConfiguration is not provided and snippetHelpCenterId is not provided', () => {
        renderComponent()

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode'
        )
    })

    it('renders MissingKnowledgeSourceAlert when storeConfiguration is not provided and snippetHelpCenterId is provided', () => {
        renderComponent({
            snippetHelpCenterId: 123,
        })

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode'
        )
    })

    it('renders children when storeConfiguration is provided and helpCenterId is not null', () => {
        renderComponent({
            storeConfiguration: getStoreConfigurationFixture({
                helpCenterId: 123,
            }),
        })

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })

    it('renders Loader when source items are loading', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
            isSourceItemsListLoading: true,
        })
        renderComponent({snippetHelpCenterId: 123})

        expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('renders missing knowledge base alert when no source items are done', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [{status: 'loading', id: 0}],
            isSourceItemsListLoading: false,
        })
        renderComponent()

        expect(screen.getByRole('alert')).toHaveTextContent(
            'Test AI Agent as a customerAt least one knowledge source is required to use test mode'
        )
    })

    it('renders children when at least one source item is done', () => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [{status: 'done', id: 0}],
            isSourceItemsListLoading: false,
        })
        renderComponent({snippetHelpCenterId: 123})

        expect(screen.getByText('Child Component')).toBeInTheDocument()
    })
})

import React from 'react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {usePublicResources} from 'pages/automate/aiAgent/hooks/usePublicResources'
import {SourceItem} from '../types'
import {PublicSourcesSection} from '../PublicSourcesSection'

jest.mock('../../../hooks/usePublicResources', () => ({
    usePublicResources: jest.fn(),
}))

const HELP_CENTER_ID = 1

const createSource = (id: number, props?: Partial<SourceItem>): SourceItem => ({
    id,
    status: 'idle',
    ...props,
})

const renderComponent = () => {
    render(<PublicSourcesSection helpCenterId={HELP_CENTER_ID} />)
}

const mockUsePublicResources = jest.mocked(usePublicResources)

describe('<PublicSourcesSection />', () => {
    beforeEach(() => {
        mockUsePublicResources.mockReturnValue({
            sourceItems: [],
        })
    })
    it('should render component', () => {
        renderComponent()

        expect(screen.getByText('Public URL sources')).toBeInTheDocument()
    })

    it('should add new item when add URL clicked', () => {
        renderComponent()

        const addButton = screen.getByTestId('add-button')
        addButton.click()

        expect(screen.getAllByTestId('source-item')).toHaveLength(1)
    })

    it('should preprender public sources', () => {
        const sources = [createSource(1), createSource(2), createSource(3)]
        mockUsePublicResources.mockReturnValue({sourceItems: sources})

        renderComponent()

        expect(screen.getAllByTestId('source-item')).toHaveLength(3)
    })

    it('should delete item when delete clicked', () => {
        renderComponent()

        const addButton = screen.getByTestId('add-button')
        addButton.click()
        const deleteButton = screen.getByLabelText('Delete public URL')
        deleteButton.click()

        expect(screen.queryByTestId('source-item')).not.toBeInTheDocument()
    })

    it('should open URL in new tab when URL clicked', async () => {
        const url = 'https://example.com'
        renderComponent()
        const addButton = screen.getByTestId('add-button')
        addButton.click()

        const openButton = screen.getByLabelText('Open public URL')
        expect(openButton).toBeDisabled()

        await userEvent.type(screen.getByLabelText('Public URL'), url)
        openButton.click()

        expect(window.open).toHaveBeenCalledWith(
            url,
            '_blank',
            'noopener noreferrer'
        )
    })

    it('should disable add button when limit riched', () => {
        const sources = Array.from({length: 10}, (_, i) => createSource(i + 1))
        mockUsePublicResources.mockReturnValue({sourceItems: sources})

        renderComponent()
        const addButton = screen.getByTestId('add-button')

        expect(addButton).toBeDisabled()
    })
})

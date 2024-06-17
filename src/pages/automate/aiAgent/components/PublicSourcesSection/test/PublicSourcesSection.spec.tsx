import React, {ComponentProps} from 'react'
import {screen, within} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {usePublicResourceMutation} from 'pages/automate/aiAgent/hooks/usePublicResourcesMutation'
import {renderWithQueryClientProvider} from 'tests/reactQueryTestingUtils'
import {SourceItem} from '../types'
import {PublicSourcesSection} from '../PublicSourcesSection'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('../../../hooks/usePublicResourcesPooling', () => ({
    usePublicResourcesPooling: jest.fn(),
}))

jest.mock('../../../hooks/usePublicResourcesMutation', () => ({
    usePublicResourceMutation: jest.fn(),
}))

const HELP_CENTER_ID = 1

const createSource = (id: number, props?: Partial<SourceItem>): SourceItem => ({
    id,
    url: `https://example.com/${id}`,
    status: 'idle',
    ...props,
})

const renderComponent = (
    props?: Partial<ComponentProps<typeof PublicSourcesSection>>
) => {
    renderWithQueryClientProvider(
        <PublicSourcesSection
            onPublicURLsChanged={jest.fn()}
            helpCenterId={HELP_CENTER_ID}
            shopName="test"
            {...props}
        />
    )
}

const mockUsePublicResourcesMutation = jest.mocked(usePublicResourceMutation)

describe('<PublicSourcesSection />', () => {
    beforeEach(() => {
        mockUsePublicResourcesMutation.mockReturnValue({
            addPublicResource: jest.fn(),
            deletePublicResource: jest.fn(),
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

        renderComponent({sourceItems: sources})

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

        renderComponent({sourceItems: sources})
        const addButton = screen.getByTestId('add-button')

        expect(addButton).toBeDisabled()
    })

    it('should not add duplicates urls', async () => {
        const url = 'https://example.com/article'
        const sources = [createSource(1, {url}), createSource(2)]

        renderComponent({sourceItems: sources})

        const addButton = screen.getByTestId('add-button')
        userEvent.click(addButton)

        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement

        await userEvent.type(input, url)

        const lastElement = screen
            .getAllByTestId('source-item')
            .pop() as HTMLElement
        const syncButton = within(lastElement).getByTestId('sync-button')

        expect(syncButton).toBeDisabled()
        expect(
            within(lastElement).getByText('This URL has already been added')
        ).toBeInTheDocument()
    })

    it('should show error message when URL is invalid', async () => {
        const url = 'invalid-url'
        renderComponent()

        const addButton = screen.getByTestId('add-button')
        userEvent.click(addButton)

        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)
        const lastElement = screen
            .getAllByTestId('source-item')
            .pop() as HTMLElement
        const syncButton = within(lastElement).getByTestId('sync-button')

        expect(syncButton).toBeDisabled()
        expect(within(lastElement).getByText('Invalid URL')).toBeInTheDocument()
    })

    it('should show error message when URL cannot be processed', () => {
        const sources = [createSource(1, {status: 'error'})]
        renderComponent({sourceItems: sources})

        const lastElement = screen
            .getAllByTestId('source-item')
            .pop() as HTMLElement
        const syncButton = within(lastElement).getByTestId('sync-button')

        expect(syncButton).toBeEnabled()
        expect(
            within(lastElement).getByText('URL cannot be processed')
        ).toBeInTheDocument()
    })

    it('should start loading when URL is syncing', async () => {
        renderComponent()

        const addButton = screen.getByTestId('add-button')
        userEvent.click(addButton)

        const lastElement = screen
            .getAllByTestId('source-item')
            .pop() as HTMLElement
        const input = within(lastElement).getByLabelText('Public URL')
        const syncButton = within(lastElement).getByTestId('sync-button')

        await userEvent.type(input, 'https://example.com')
        userEvent.click(syncButton)

        expect(syncButton).toBeDisabled()
        expect(input).toBeDisabled()
    })
})

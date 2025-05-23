import React, { ComponentProps } from 'react'

import { screen } from '@testing-library/react'

import { useSearchParam } from 'hooks/useSearchParam'
import {
    ARTICLE_INGESTION_LOGS_STATUS,
    WIZARD_POST_COMPLETION_STATE,
} from 'pages/aiAgent/constants'
import { usePublicResourceMutation } from 'pages/aiAgent/hooks/usePublicResourcesMutation'
import { usePublicResourcesPooling } from 'pages/aiAgent/hooks/usePublicResourcesPooling'
import useHelpCenterCustomDomainHostnames from 'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames'
import { renderWithQueryClientProvider } from 'tests/reactQueryTestingUtils'
import { userEvent } from 'utils/testing/userEvent'

import { PublicSourcesSection } from '../PublicSourcesSection'
import { SourceItem } from '../types'

jest.mock('hooks/useAppDispatch', () => () => jest.fn())
jest.mock('pages/aiAgent/hooks/usePublicResourcesPooling', () => ({
    usePublicResourcesPooling: jest.fn(),
}))

jest.mock('pages/aiAgent/hooks/usePublicResourcesMutation', () => ({
    usePublicResourceMutation: jest.fn(),
}))

jest.mock(
    'pages/settings/helpCenter/hooks/useHelpCenterCustomDomainHostnames',
    () => jest.fn(),
)
jest.mock('hooks/useSearchParam', () => ({
    useSearchParam: jest.fn(),
}))

const HELP_CENTER_ID = 1

const createSource = (id: number, props?: Partial<SourceItem>): SourceItem => ({
    id,
    url: `https://example.com/${id}`,
    status: 'idle',
    createdDatetime: '2021-01-01T00:00:00.000Z',
    ...props,
})

const renderComponent = (
    props?: Partial<ComponentProps<typeof PublicSourcesSection>>,
) => {
    renderWithQueryClientProvider(
        <PublicSourcesSection
            onPublicURLsChanged={jest.fn()}
            helpCenterId={HELP_CENTER_ID}
            shopName="test"
            {...props}
        />,
    )
}

const mockUsePublicResourcesMutation = jest.mocked(usePublicResourceMutation)
const mockUseHelpCenterCustomDomainHostnames = jest.mocked(
    useHelpCenterCustomDomainHostnames,
)
const mockUsePublicResourcesPooling = jest.mocked(usePublicResourcesPooling)
const mockUseSearchParam = jest.mocked(useSearchParam)

describe('<PublicSourcesSection />', () => {
    beforeEach(() => {
        mockUsePublicResourcesMutation.mockReturnValue({
            addPublicResource: jest.fn(),
            deletePublicResource: jest.fn(),
        })
        mockUseHelpCenterCustomDomainHostnames.mockReturnValue({
            customDomainHostnames: [
                'help-center-example.com',
                'help-center-test.com',
            ],
            isLoading: false,
        })
        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogsStatus: [],
        })
        mockUseSearchParam.mockReturnValue([null, jest.fn()])
    })
    it('should render component', () => {
        renderComponent()

        expect(screen.getByText('Public URL sources')).toBeInTheDocument()
    })

    it('should add new item when add URL clicked', () => {
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        expect(screen.getAllByText(/Sync URL/)).toHaveLength(1)
    })

    it('should preprender public sources', () => {
        const sources = [createSource(1), createSource(2), createSource(3)]

        renderComponent({ sourceItems: sources })

        expect(screen.getAllByText(/Sync URL/)).toHaveLength(3)
    })

    it('should delete item when delete clicked', () => {
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)
        const deleteButton = screen.getByLabelText('Delete public URL')
        userEvent.click(deleteButton)

        expect(screen.queryByTestId('source-item')).not.toBeInTheDocument()
    })

    it('should open URL in new tab when URL clicked', async () => {
        const url = 'https://example.com/faqs'
        renderComponent()
        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const openButton = screen.getByLabelText('Open public URL')
        expect(openButton).toBeAriaDisabled()

        await userEvent.type(screen.getByLabelText('Public URL'), url)
        openButton.click()

        expect(window.open).toHaveBeenCalledWith(
            url,
            '_blank',
            'noopener noreferrer',
        )
    })

    it('should disable add button when limit reached', () => {
        const sources = Array.from({ length: 10 }, (_, i) =>
            createSource(i + 1),
        )

        renderComponent({ sourceItems: sources })
        const addButton = screen.getByRole('button', {
            name: /Add URL/,
        })
        expect(addButton).toBeAriaDisabled()
    })

    it('should not add duplicates urls', async () => {
        const url = 'https://example.com/article'
        const sources = [createSource(1, { url }), createSource(2)]

        renderComponent({ sourceItems: sources })

        const addButton = screen.getByRole('button', {
            name: /Add URL/,
        })
        userEvent.click(addButton)

        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement

        await userEvent.type(input, url)

        const syncButton = screen
            .getAllByRole('button', { name: /Sync URL/ })
            .pop()

        expect(syncButton).toBeAriaDisabled()
        expect(
            screen.getByText('This URL has already been added'),
        ).toBeInTheDocument()
    })

    it('should show error message when URL is invalid', async () => {
        const url = 'invalid-url'
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)

        expect(
            screen.getByRole('button', { name: /Sync URL/ }),
        ).toBeAriaDisabled()
        expect(screen.getByText('Invalid URL')).toBeInTheDocument()
    })

    it('should show error message when URL cannot be processed', () => {
        const sources = [createSource(1, { status: 'error' })]
        renderComponent({ sourceItems: sources })

        expect(screen.getByRole('button', { name: /Sync URL/ })).toBeEnabled()
        expect(screen.getByText('URL cannot be processed')).toBeInTheDocument()
    })

    it('should show error message when URL is root', async () => {
        const url = 'https://example.com'
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)
        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)

        expect(
            screen.getByRole('button', { name: /Sync URL/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByText(
                'URL must include a subpage (ie. yourstore.com/faqs)',
            ),
        ).toBeInTheDocument()
    })

    it('should show error message when URL is from Gorgias Help Center', async () => {
        const url = 'https://example.gorgias.help/faqs'
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)
        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)

        expect(
            screen.getByRole('button', { name: /Sync URL/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByText('URL cannot be a Gorgias Help Center'),
        ).toBeInTheDocument()
    })

    it('should show error message when URL is from selected Help Center custom domain', async () => {
        const url = 'https://help-center-example.com/faqs'
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)
        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)

        expect(
            screen.getByRole('button', { name: /Sync URL/ }),
        ).toBeAriaDisabled()
        expect(
            screen.getByText('URL cannot be a Gorgias Help Center'),
        ).toBeInTheDocument()
    })

    it('should show error message when URL has document extension', async () => {
        const url = 'https://test-page.com/file.pdf'
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const input = screen
            .getAllByLabelText('Public URL')
            .pop() as HTMLInputElement
        await userEvent.type(input, url)

        expect(
            screen.getByRole('button', { name: /Sync URL/ }),
        ).toBeAriaDisabled()
        expect(screen.getByText('URL cannot be a document')).toBeInTheDocument()
    })

    it('should start loading when URL is syncing', async () => {
        renderComponent()

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const syncButton = screen.getByRole('button', { name: /Sync URL/ })
        const input = screen.getByLabelText('Public URL')

        await userEvent.type(input, 'https://example.com/faqs')
        userEvent.click(syncButton)

        expect(syncButton).toBeAriaDisabled()
        expect(input).toBeDisabled()
    })

    it('should set isSuccessResources to true when all resources are successfully synced', () => {
        mockUseSearchParam.mockReturnValue([
            WIZARD_POST_COMPLETION_STATE.knowledge,
            jest.fn(),
        ])
        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogsStatus: [
                ARTICLE_INGESTION_LOGS_STATUS.SUCCESSFUL,
            ],
        })
        const mockedSetIsSuccessResources = jest.fn()

        renderComponent({ setIsSuccessResources: mockedSetIsSuccessResources })

        expect(mockedSetIsSuccessResources).toHaveBeenCalledWith(true)
    })

    it('should set isFailedResources to true when there is failed sync', () => {
        mockUseSearchParam.mockReturnValue([
            WIZARD_POST_COMPLETION_STATE.knowledge,
            jest.fn(),
        ])
        mockUsePublicResourcesPooling.mockReturnValue({
            articleIngestionLogsStatus: [ARTICLE_INGESTION_LOGS_STATUS.FAILED],
        })
        const mockedSetIsFailedResources = jest.fn()

        renderComponent({ setIsFailedResources: mockedSetIsFailedResources })

        expect(mockedSetIsFailedResources).toHaveBeenCalledWith(true)
    })

    it('should sync URL when syncUrlOnCommand triggers', async () => {
        const mockedSetSyncUrlOnCommand = jest.fn()
        const mockedSetIsPristine = jest.fn()
        renderComponent({
            syncUrlOnCommand: true,
            setSyncUrlOnCommand: mockedSetSyncUrlOnCommand,
            setIsPristine: mockedSetIsPristine,
        })

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const input = screen.getByLabelText('Public URL')
        await userEvent.type(input, 'https://example.com/faqs')

        expect(mockedSetIsPristine).toHaveBeenCalledWith(true)
        const syncButton = screen.getByRole('button', { name: /Sync URL/ })
        expect(syncButton).toBeAriaDisabled()
        expect(input).toBeDisabled()

        expect(mockedSetSyncUrlOnCommand).toHaveBeenCalledWith(false)
    })

    it('should log connected public url', async () => {
        const mockedLogConnectedPublicUrl = jest.fn()
        renderComponent({ logConnectedPublicUrl: mockedLogConnectedPublicUrl })

        const addButton = screen.getByText('Add URL')
        userEvent.click(addButton)

        const syncButton = screen.getByRole('button', { name: /Sync URL/ })
        const input = screen.getByLabelText('Public URL')

        await userEvent.type(input, 'https://example.com/faqs')
        userEvent.click(syncButton)

        expect(mockedLogConnectedPublicUrl).toHaveBeenCalledWith(
            'https://example.com/faqs',
        )
    })
})

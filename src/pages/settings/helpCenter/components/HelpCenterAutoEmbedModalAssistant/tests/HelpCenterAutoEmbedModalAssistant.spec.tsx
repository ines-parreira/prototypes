import {QueryClientProvider} from '@tanstack/react-query'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {ShopifyPagesListFixture} from 'pages/settings/contactForm/fixtures/shopifyPage'
import {HELP_CENTER_EMBED_FORM_TEXTS} from 'pages/settings/helpCenter/constants'
import {useCreatePageEmbedment} from 'pages/settings/helpCenter/queries'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {assumeMock} from 'utils/testing'

import {MODAL_LABELS} from '../constants'
import HelpCenterAutoEmbedModalAssistant from '../HelpCenterAutoEmbedModalAssistant'

const queryClient = mockQueryClient()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock('pages/settings/helpCenter/queries')
const mockCreatePageEmbedment = jest.fn()
const useCreatePageEmbedmentMock = assumeMock(useCreatePageEmbedment)

describe('<HelpCenterAutoEmbedModalAssistant />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        useCreatePageEmbedmentMock.mockImplementation(() => {
            return {
                mutate: mockCreatePageEmbedment,
                mutateAsync: mockCreatePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useCreatePageEmbedment>
        })
    })
    it('it renders the component', () => {
        const isOpen = true
        const onClose = jest.fn()
        const pages = ShopifyPagesListFixture
        const helpCenterId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <HelpCenterAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    helpCenterId={helpCenterId}
                />
            </QueryClientProvider>
        )

        screen.getByText(MODAL_LABELS.TITLE, {selector: 'div'})
        screen.getByRole('button', {name: MODAL_LABELS.EMBED})
        screen.getByText(MODAL_LABELS.CANCEL)

        // a PageEmbedmentForm label
        screen.getByText(MODAL_LABELS.FORM_MODE_SELECTION_TITLE)
    })

    it('closes the modal assistant when clicking on the cancel button', () => {
        const isOpen = true
        const onClose = jest.fn()
        const pages = ShopifyPagesListFixture
        const helpCenterId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <HelpCenterAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    helpCenterId={helpCenterId}
                />
            </QueryClientProvider>
        )

        const cancelButton = screen.getByText(MODAL_LABELS.CANCEL)
        userEvent.click(cancelButton)

        expect(onClose).toHaveBeenCalled()
    })

    it('should try embedding the form when clicking on the embed button', async () => {
        const isOpen = true
        const onClose = jest.fn()
        const pages = ShopifyPagesListFixture
        const helpCenterId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <HelpCenterAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    helpCenterId={helpCenterId}
                />
            </QueryClientProvider>
        )

        const embedButton = screen.getByRole('button', {
            name: MODAL_LABELS.EMBED,
        })

        expect(embedButton).toBeAriaDisabled()

        const pageNameInput = screen.getByPlaceholderText(
            HELP_CENTER_EMBED_FORM_TEXTS.PageNamePlaceholder
        )
        const pageSlugInput = screen.getByPlaceholderText(
            HELP_CENTER_EMBED_FORM_TEXTS.PageSlugPlaceholder
        )

        // Set the page name and slug
        await userEvent.type(pageNameInput, 'Help Center')
        await userEvent.type(pageSlugInput, 'help-center')

        await waitFor(() => {
            expect(embedButton).toBeAriaEnabled()
        })

        fireEvent.click(embedButton)

        await waitFor(() => {
            expect(mockCreatePageEmbedment).toHaveBeenCalled()
        })
    })
})

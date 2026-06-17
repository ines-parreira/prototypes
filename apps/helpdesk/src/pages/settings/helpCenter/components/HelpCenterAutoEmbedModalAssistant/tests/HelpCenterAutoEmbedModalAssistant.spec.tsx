import React from 'react'

import { assumeMock, render, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { toast } from '@gorgias/axiom'

import { ShopifyPagesListFixture } from 'pages/settings/contactForm/fixtures/shopifyPage'
import { HELP_CENTER_EMBED_FORM_TEXTS } from 'pages/settings/helpCenter/constants'
import { PageEmbedmentFixture } from 'pages/settings/helpCenter/fixtures/pageEmbedment'
import { useCreatePageEmbedment } from 'pages/settings/helpCenter/queries'
import type { createPageEmbedment } from 'pages/settings/helpCenter/resources'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { MODAL_LABELS } from '../constants'
import { HelpCenterAutoEmbedModalAssistant } from '../HelpCenterAutoEmbedModalAssistant'

const queryClient = mockQueryClient()
jest.mock('pages/settings/helpCenter/queries')
const mockCreatePageEmbedment = jest.fn()
const useCreatePageEmbedmentMock = assumeMock(useCreatePageEmbedment)

let capturedOverrides: Parameters<typeof useCreatePageEmbedment>[0] | undefined

describe('<HelpCenterAutoEmbedModalAssistant />', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        capturedOverrides = undefined
        useCreatePageEmbedmentMock.mockImplementation((overrides) => {
            capturedOverrides = overrides
            return {
                mutate: mockCreatePageEmbedment,
                mutateAsync: mockCreatePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useCreatePageEmbedment>
        })
    })

    afterEach(() => {
        toast.dismiss()
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
            </QueryClientProvider>,
        )

        screen.getByText(MODAL_LABELS.TITLE, { selector: 'div' })
        screen.getByRole('button', { name: MODAL_LABELS.EMBED })
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
            </QueryClientProvider>,
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
            </QueryClientProvider>,
        )

        const embedButton = screen.getByRole('button', {
            name: MODAL_LABELS.EMBED,
        })

        expect(embedButton).toBeAriaDisabled()

        const pageNameInput = screen.getByPlaceholderText(
            HELP_CENTER_EMBED_FORM_TEXTS.PageNamePlaceholder,
        )
        const pageSlugInput = screen.getByPlaceholderText(
            HELP_CENTER_EMBED_FORM_TEXTS.PageSlugPlaceholder,
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

    const renderModal = () => {
        const onClose = jest.fn()

        render(
            <QueryClientProvider client={queryClient}>
                <HelpCenterAutoEmbedModalAssistant
                    isOpen
                    onClose={onClose}
                    pages={ShopifyPagesListFixture}
                    helpCenterId={1}
                />
            </QueryClientProvider>,
        )

        return { onClose }
    }

    const mutationVariables: Parameters<typeof createPageEmbedment> = [
        undefined,
        { help_center_id: 1 },
        { page_external_id: '1', position: 'TOP' },
    ]

    it('shows an info toast when the page embedment succeeds without a result', async () => {
        renderModal()

        await capturedOverrides?.onSuccess?.(null, mutationVariables, undefined)

        const toastEl = await screen.findByRole('status', {
            name: 'Something went wrong',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'info')
    })

    it('shows a success toast when the page embedment succeeds', async () => {
        renderModal()

        await capturedOverrides?.onSuccess?.(
            PageEmbedmentFixture,
            mutationVariables,
            undefined,
        )

        const toastEl = await screen.findByRole('status', {
            name: 'Help Center embedded to page.',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'success')
    })

    it('shows an error toast when the page embedment fails', async () => {
        renderModal()

        await capturedOverrides?.onError?.(
            { response: { data: { error: { msg: 'Embedding failed' } } } },
            mutationVariables,
            undefined,
        )

        const toastEl = await screen.findByRole('status', {
            name: 'Embedding failed',
        })
        expect(toastEl).toHaveAttribute('data-intent', 'destructive')
    })
})

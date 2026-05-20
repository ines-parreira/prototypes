import React from 'react'

import { assumeMock, render, userEvent } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, screen, waitFor } from '@testing-library/react'

import { toast } from '@gorgias/axiom'

import { CONTACT_FORM_EMBED_FORM_TEXTS } from 'pages/settings/contactForm/constants'
import { ShopifyPagesListFixture } from 'pages/settings/contactForm/fixtures/shopifyPage'
import { useCreatePageEmbedment } from 'pages/settings/contactForm/queries'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

import { MODAL_LABELS } from '../constants'
import ContactFormAutoEmbedModalAssistant from '../ContactFormAutoEmbedModalAssistant'

const queryClient = mockQueryClient()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')
jest.mock('pages/settings/contactForm/queries')
const mockCreatePageEmbedment = jest.fn()
const useCreatePageEmbedmentMock = assumeMock(useCreatePageEmbedment)

describe('<ContactFormAutoEmbedModalAssistant />', () => {
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
        const contactFormId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <ContactFormAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    contactFormId={contactFormId}
                />
            </QueryClientProvider>,
        )

        screen.getByText(MODAL_LABELS.TITLE)
        screen.getByText(MODAL_LABELS.EMBED)
        screen.getByText(MODAL_LABELS.CANCEL)

        // a PageEmbedmentForm label
        screen.getByText(MODAL_LABELS.FORM_MODE_SELECTION_TITLE)
    })

    it('closes the modal assistant when clicking on the cancel button', () => {
        const isOpen = true
        const onClose = jest.fn()
        const pages = ShopifyPagesListFixture
        const contactFormId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <ContactFormAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    contactFormId={contactFormId}
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
        const contactFormId = 1

        render(
            <QueryClientProvider client={queryClient}>
                <ContactFormAutoEmbedModalAssistant
                    isOpen={isOpen}
                    onClose={onClose}
                    pages={pages}
                    contactFormId={contactFormId}
                />
            </QueryClientProvider>,
        )

        const embedButton = screen.getByRole('button', {
            name: MODAL_LABELS.EMBED,
        })

        expect(embedButton).toBeAriaDisabled()

        const pageNameInput = screen.getByPlaceholderText(
            CONTACT_FORM_EMBED_FORM_TEXTS.PageNamePlaceholder,
        )
        const pageSlugInput = screen.getByPlaceholderText(
            CONTACT_FORM_EMBED_FORM_TEXTS.PageSlugPlaceholder,
        )

        // Set the page name and slug
        await userEvent.type(pageNameInput, 'Help Center')
        await userEvent.type(pageSlugInput, 'help-center')

        await waitFor(() => {
            expect(embedButton).not.toBeAriaDisabled()
        })

        fireEvent.click(embedButton)

        await waitFor(() => {
            expect(mockCreatePageEmbedment).toHaveBeenCalled()
        })
    })

    describe('toast notifications', () => {
        afterEach(() => {
            toast.dismiss()
        })

        it('should show a success toast when onSuccess is called with a new embedment', async () => {
            let onSuccessCallback:
                | ((newPageEmbedment: unknown) => void)
                | undefined
            useCreatePageEmbedmentMock.mockImplementation(((overrides: any) => {
                onSuccessCallback = overrides?.onSuccess
                return {
                    mutate: jest.fn(),
                    mutateAsync: jest.fn(),
                    isLoading: false,
                } as unknown as ReturnType<typeof useCreatePageEmbedment>
            }) as any)

            render(
                <QueryClientProvider client={queryClient}>
                    <ContactFormAutoEmbedModalAssistant
                        isOpen={true}
                        onClose={jest.fn()}
                        pages={ShopifyPagesListFixture}
                        contactFormId={1}
                    />
                </QueryClientProvider>,
            )

            await act(async () => {
                onSuccessCallback?.({ id: 99 })
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Form embedded to page.',
                    }),
                ).toHaveAttribute('data-intent', 'success')
            })
        })

        it('should show an info toast when onSuccess is called without a new embedment', async () => {
            let onSuccessCallback:
                | ((newPageEmbedment: unknown) => void)
                | undefined
            useCreatePageEmbedmentMock.mockImplementation(((overrides: any) => {
                onSuccessCallback = overrides?.onSuccess
                return {
                    mutate: jest.fn(),
                    mutateAsync: jest.fn(),
                    isLoading: false,
                } as unknown as ReturnType<typeof useCreatePageEmbedment>
            }) as any)

            render(
                <QueryClientProvider client={queryClient}>
                    <ContactFormAutoEmbedModalAssistant
                        isOpen={true}
                        onClose={jest.fn()}
                        pages={ShopifyPagesListFixture}
                        contactFormId={1}
                    />
                </QueryClientProvider>,
            )

            await act(async () => {
                onSuccessCallback?.(undefined)
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', {
                        name: 'Something went wrong',
                    }),
                ).toHaveAttribute('data-intent', 'info')
            })
        })

        it('should show an error toast when onError is called with a generic error message', async () => {
            let onErrorCallback: ((error: unknown) => void) | undefined
            useCreatePageEmbedmentMock.mockImplementation(((overrides: any) => {
                onErrorCallback = overrides?.onError
                return {
                    mutate: jest.fn(),
                    mutateAsync: jest.fn(),
                    isLoading: false,
                } as unknown as ReturnType<typeof useCreatePageEmbedment>
            }) as any)

            render(
                <QueryClientProvider client={queryClient}>
                    <ContactFormAutoEmbedModalAssistant
                        isOpen={true}
                        onClose={jest.fn()}
                        pages={ShopifyPagesListFixture}
                        contactFormId={1}
                    />
                </QueryClientProvider>,
            )

            await act(async () => {
                onErrorCallback?.({
                    response: { data: { error: { msg: 'Server explosion' } } },
                })
            })

            await waitFor(() => {
                expect(
                    screen.getByRole('status', { name: 'Server explosion' }),
                ).toHaveAttribute('data-intent', 'destructive')
            })
        })
    })
})

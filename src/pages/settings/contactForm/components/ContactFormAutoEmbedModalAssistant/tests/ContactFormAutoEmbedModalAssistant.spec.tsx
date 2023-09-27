import React from 'react'
import {render, screen} from '@testing-library/react'
import {QueryClientProvider} from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import {ShopifyPagesListFixture} from 'pages/settings/contactForm/fixtures/shopifyPage'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import {MODAL_LABELS} from '../constants'
import ContactFormAutoEmbedModalAssistant from '../ContactFormAutoEmbedModalAssistant'

const queryClient = mockQueryClient()
const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)
jest.mock('state/notifications/actions')

describe('<ContactFormAutoEmbedModalAssistant />', () => {
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
            </QueryClientProvider>
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
            </QueryClientProvider>
        )

        const cancelButton = screen.getByText(MODAL_LABELS.CANCEL)
        userEvent.click(cancelButton)

        expect(onClose).toHaveBeenCalled()
    })

    it.todo('should try embedding the form when clicking on the embed button')
})

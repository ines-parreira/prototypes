import { logEvent, SegmentEvent } from '@repo/logging'
import { assumeMock, render, userEvent } from '@repo/testing'
import { act, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { toast } from '@gorgias/axiom'

import { account, account as accountFixture } from 'fixtures/account'
import { integrationsState } from 'fixtures/integrations'
import { user as userFixture } from 'fixtures/users'
import type { ContactFormPageEmbedment } from 'models/contactForm/types'
import { PageEmbedmentPosition } from 'pages/common/components/PageEmbedmentForm'
import { CONTACT_FORM_PUBLISH_PATH } from 'pages/settings/contactForm/constants'
import { CurrentContactFormContext } from 'pages/settings/contactForm/contexts/currentContactForm.context'
import { ContactFormFixture } from 'pages/settings/contactForm/fixtures/contacForm'
import {
    useDeletePageEmbedment,
    useUpdatePageEmbedment,
} from 'pages/settings/contactForm/queries'
import type { RootState } from 'state/types'

import { ManageEmbedments } from '../ManageEmbedments'

jest.mock('@repo/logging')
const logEventMock = logEvent as jest.MockedFunction<typeof logEvent>
jest.mock(
    'pages/settings/contactForm/queries',
    () =>
        ({
            ...jest.requireActual('pages/settings/contactForm/queries'),
            useUpdatePageEmbedment: jest.fn(),
            useDeletePageEmbedment: jest.fn(),
        }) as Record<string, unknown>,
)
const mockUpdatePageEmbedment = jest.fn()
const mockDeletePageEmbedment = jest.fn()
const useUpdatePageEmbedmentMock = assumeMock(useUpdatePageEmbedment)
const useDeletePageEmbedmentMock = assumeMock(useDeletePageEmbedment)
let capturedUpdateOverrides:
    | Parameters<typeof useUpdatePageEmbedment>[0]
    | undefined
let capturedDeleteOverrides:
    | Parameters<typeof useDeletePageEmbedment>[0]
    | undefined
const embedments: ContactFormPageEmbedment[] = Array.from({ length: 3 }).map(
    (_, i) => ({
        id: i + 1,
        page_path_url: `/pages/test-${i}`,
        page_title: `Test ${i}`,
        page_external_id: (i + 1000).toString(),
        position: PageEmbedmentPosition.TOP,
        updated_datetime: '2021-01-01T00:00:00.000Z',
        created_datetime: '2021-01-01T00:00:00.000Z',
    }),
)
const contactForm = {
    ...ContactFormFixture,
    shop_integration: {
        shop_name: 'shop-name',
        shop_type: 'shopify' as const,
        integration_id: 1,
        account_id: account.id,
    },
}
const defaultState: Partial<RootState> = {
    integrations: fromJS(integrationsState),
    currentAccount: fromJS(accountFixture),
    currentUser: fromJS(userFixture),
}
const renderView = ({
    state,
    path = CONTACT_FORM_PUBLISH_PATH,
    route = CONTACT_FORM_PUBLISH_PATH,
    embedments,
}: {
    state: Partial<RootState>
    path?: string
    route?: string
    embedments: ContactFormPageEmbedment[]
}) => {
    return render(
        <CurrentContactFormContext.Provider value={contactForm}>
            <>
                <ManageEmbedments embedments={embedments} />,
            </>
        </CurrentContactFormContext.Provider>,
        { path: path, initialEntries: [route], storeState: state },
    )
}
describe('ContactFormPublish', () => {
    beforeEach(() => {
        jest.resetAllMocks()
        capturedUpdateOverrides = undefined
        capturedDeleteOverrides = undefined
        useUpdatePageEmbedmentMock.mockImplementation((overrides) => {
            capturedUpdateOverrides = overrides
            return {
                mutate: mockUpdatePageEmbedment,
                mutateAsync: mockUpdatePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useUpdatePageEmbedmentMock>
        })
        useDeletePageEmbedmentMock.mockImplementation((overrides) => {
            capturedDeleteOverrides = overrides
            return {
                mutate: mockDeletePageEmbedment,
                mutateAsync: mockDeletePageEmbedment,
                isLoading: false,
            } as unknown as ReturnType<typeof useDeletePageEmbedmentMock>
        })
    })

    afterEach(() => {
        toast.dismiss()
    })
    it('wording check', () => {
        renderView({ state: defaultState, embedments })
        screen.getByText('Manage embedded pages')
        screen.getByText(/Edit the position of the contact form/)
        screen.getByText(/Note: Manually embedded pages will/)
    })
    it('renders the embedments', () => {
        renderView({ state: defaultState, embedments })
        embedments.forEach((embedment) => {
            // Renders the page title for each embedment
            screen.getByText(embedment.page_title)
            // Renders the delete button for each embedment
            screen.getByTestId(`delete-button-${embedment.id}`)
            // Renders the preview button for each embedment
            const link = screen.getByTestId(`preview-button-${embedment.id}`)
            expect(link).toHaveAttribute(
                'href',
                `https://${contactForm.shop_integration.shop_name}.myshopify.com${embedment.page_path_url}`,
            )
        })
        // Renders the select field for position for each embedment
        const positionSelectFields = screen.getAllByText(/top/i)
        expect(positionSelectFields).toHaveLength(embedments.length)
    })
    it('logs an event when trying to embed on another page', () => {
        renderView({ state: defaultState, embedments })
        const button = screen.getByText(/embed on another page/i)
        userEvent.click(button)
        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.ContactFormAutoEmbedEmbedOnAnotherPageClicked,
            {
                user_id: userFixture.id,
                account_domain: accountFixture.domain,
                contact_form_id: contactForm.id,
                page_embedments_count: embedments.length,
            },
        )
    })
    it('saves the changes when Save Changes is clicked', async () => {
        renderView({ state: defaultState, embedments: [embedments[0]] })
        const button = screen.getByRole('button', { name: /save changes/i })
        expect(button).toBeAriaDisabled()
        // Change the position of the first embedment
        const select = screen.getByText(/top/i)
        userEvent.click(select)
        const option = screen.getByText(/bottom/i)
        userEvent.click(option)
        await waitFor(() => {
            expect(button).toBeAriaEnabled()
        })
        userEvent.click(button)
        //expect Save action to be called
        await waitFor(() => {
            expect(mockUpdatePageEmbedment).toHaveBeenCalled()
        })
        const deleteButton = screen.getByTestId(`delete-button-1`)
        userEvent.click(deleteButton)
        const confirmButton = screen.getByRole('button', {
            name: /remove form/i,
        })
        userEvent.click(confirmButton)
        //expect Delete action to be called
        await waitFor(() => {
            expect(mockDeletePageEmbedment).toHaveBeenCalled()
        })
    })

    it('shows a success toast when a page embedment update succeeds', async () => {
        renderView({ state: defaultState, embedments })
        await act(async () => {
            await capturedUpdateOverrides?.onSuccess?.(
                embedments[0] as never,
                [undefined, { contact_form_id: contactForm.id }] as never,
                undefined,
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Form position updated' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an info toast when the update returns no embedment', async () => {
        renderView({ state: defaultState, embedments })
        await act(async () => {
            await capturedUpdateOverrides?.onSuccess?.(
                undefined as never,
                [undefined, { contact_form_id: contactForm.id }] as never,
                undefined,
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Something went wrong' }),
            ).toHaveAttribute('data-intent', 'info')
        })
    })

    it('shows an error toast when a page embedment update fails', async () => {
        renderView({ state: defaultState, embedments })
        act(() => {
            capturedUpdateOverrides?.onError?.(
                {} as never,
                [undefined, { contact_form_id: contactForm.id }] as never,
                undefined,
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Something went wrong' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })

    it('shows a success toast when a page embedment is removed', async () => {
        renderView({ state: defaultState, embedments })
        await act(async () => {
            await capturedDeleteOverrides?.onSuccess?.(
                undefined as never,
                [
                    undefined,
                    {
                        contact_form_id: contactForm.id,
                        embedment_id: embedments[0].id,
                    },
                ] as never,
                undefined,
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Form removed from page.' }),
            ).toHaveAttribute('data-intent', 'success')
        })
    })

    it('shows an error toast when removing a page embedment fails', async () => {
        renderView({ state: defaultState, embedments })
        act(() => {
            capturedDeleteOverrides?.onError?.(
                {} as never,
                [
                    undefined,
                    {
                        contact_form_id: contactForm.id,
                        embedment_id: embedments[0].id,
                    },
                ] as never,
                undefined,
            )
        })

        await waitFor(() => {
            expect(
                screen.getByRole('status', { name: 'Something went wrong' }),
            ).toHaveAttribute('data-intent', 'destructive')
        })
    })
})

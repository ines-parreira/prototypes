import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { act, render, screen, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'
import { useConvertGeneralSettings } from 'domains/reporting/pages/convert/hooks/useConvertGeneralSettings'
import { user } from 'fixtures/users'
import AddContactCaptureForm from 'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm'
import { ContactFormCaptureFormIconButton } from 'pages/convert/campaigns/components/ContactCaptureForm/ContactCaptureFormIconButton'
import { Customization } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/Customization'
import { PostSubmissionMessage } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/PostSubmissionMessage'
import useListTags from 'tags/useListTags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'

jest.mock('tags/useListTags')
const mockStore = configureMockStore()

const queryClient = mockQueryClient()
const store = mockStore({
    currentUser: fromJS({
        ...user,
        role: { name: UserRole.Admin },
    }),
    integrations: fromJS({ integrations: [] }),
})
const mockUseListTags = useListTags as jest.Mock

jest.mock('domains/reporting/pages/convert/hooks/useConvertGeneralSettings')
const mockUseConvertGeneralSettings = assumeMock(useConvertGeneralSettings)

describe('ContactForm test suite', () => {
    const baseState = {
        subscriberTypes: {
            shopify: {
                enabled: false,
                isEmailSubscriber: false,
                isSmsSubscriber: false,
                tags: [],
            },
        },
        forms: {
            email: {
                label: '',
                cta: '',
                disclaimerEnabled: true,
                disclaimer: '',
                preSelectDisclaimer: true,
            },
        },
        postSubmissionMessage: {
            enabled: false,
            message: '',
        },
    }

    beforeEach(() => {
        mockUseListTags.mockReturnValue([])
        mockUseConvertGeneralSettings.mockReturnValue({
            emailDisclaimer: {
                enabled: true,
                disclaimer: { en: 'foo' },
                disclaimer_default_accepted: true,
            },
            isLoading: false,
        })
    })

    // TODO(React18): This test is flaky, we need to fix it
    it.skip('displays an error when more than 5 tags are added', async () => {
        const user = userEvent.setup()

        const screen = render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AddContactCaptureForm
                        open={true}
                        onOpenChange={jest.fn()}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        const input = await screen.findByPlaceholderText('Add tags...')

        const tags = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr']

        for (const tag of tags) {
            await user.type(input, `${tag}{enter}`)
        }

        // Assert the error appears immediately
        expect(
            screen.getByText('You are allowed up to 5 tags.'),
        ).toBeInTheDocument()

        // The Next button should be disabled
        expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    })

    it('should show error state when message is too long on post submission message step', async () => {
        const state = {
            ...baseState,
            postSubmissionMessage: {
                enabled: true,
                message: 'f'.repeat(281),
            },
        }
        const mockSetActiveButton = jest.fn()

        const { getByText } = render(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={mockSetActiveButton}
                    setAttachmentData={() => {}}
                    attachmentData={state}
                />
            </Provider>,
        )

        await waitFor(() => {
            expect(mockSetActiveButton).toHaveBeenCalledWith(false)
            expect(
                getByText(
                    'The message should be under or equals to 280 characters.',
                ),
            ).toBeInTheDocument()
        })
    })

    it('should have the correct behavior for step navigation buttons', () => {
        const mockOnSubmit = jest.fn()
        const mockOnCancel = jest.fn()
        const { getByText } = render(
            <Provider store={store}>
                <AddContactCaptureForm
                    open
                    onOpenChange={() => {}}
                    onCancel={mockOnCancel}
                    onSubmit={mockOnSubmit}
                    onReset={jest.fn()}
                />
            </Provider>,
        )

        // It is expected to start at the first step
        const cancelBtn = getByText('Cancel')
        expect(cancelBtn).not.toBeUndefined()

        act(() => cancelBtn.click())
        expect(mockOnCancel).toHaveBeenCalled()

        let nextButton = getByText('Next')

        act(() => nextButton.click())
        // Now it should render previous and next
        nextButton = getByText('Next')
        let previousButton = getByText('Previous')
        expect(previousButton).not.toBeUndefined()
        expect(nextButton).not.toBeUndefined()

        act(() => nextButton.click())
        // Now it should render the submit action and previous
        const submitButton = getByText('Add Form')
        previousButton = getByText('Previous')
        expect(submitButton).not.toBeUndefined()
        expect(previousButton).not.toBeUndefined()

        act(() => submitButton.click())
        expect(mockOnSubmit).toHaveBeenCalled()

        // Navigate back again to test back navigation
        previousButton = getByText('Previous')
        act(() => previousButton.click())
        previousButton = getByText('Previous')
        nextButton = getByText('Next')
        expect(previousButton).not.toBeUndefined()
        expect(nextButton).not.toBeUndefined()
    })

    // TODO(React18): This test is flaky, we need to fix it
    it.skip('should add tags in the first step and the next step should be available', async () => {
        const user = userEvent.setup()
        render(
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <AddContactCaptureForm
                        open
                        onOpenChange={() => {}}
                        onCancel={jest.fn()}
                        onSubmit={jest.fn()}
                        onReset={jest.fn()}
                    />
                </QueryClientProvider>
            </Provider>,
        )

        // Wait for the form to be fully rendered and ready
        await screen.findByText('Email Capture Form')
        const addTagsBtn = await screen.findByPlaceholderText('Add tags...')

        // Add the tag
        await user.click(addTagsBtn)
        await user.type(addTagsBtn, 'Foo')
        await user.keyboard('{Enter}')

        // Verify the tag was added
        const tagElement = await screen.findByText('Foo')
        expect(tagElement).toBeInTheDocument()

        // Find the delete button within the tag's container
        const tagContainer = tagElement.closest('.tag')
        expect(tagContainer).toBeInTheDocument()

        const deleteButton = tagContainer?.querySelector('.closeIcon')
        expect(deleteButton).toBeInTheDocument()

        // Delete the tag
        await user.click(deleteButton!)

        // Verify the tag was removed
        await waitFor(() => {
            expect(screen.queryByText('Foo')).not.toBeInTheDocument()
        })

        // Verify and click the next button
        const nextButton = await screen.findByRole('button', { name: 'Next' })
        await waitFor(() => {
            expect(nextButton).not.toBeDisabled()
        })
        await user.click(nextButton)
    })

    it('should render the Customization step', async () => {
        const state = {
            subscriberTypes: {
                shopify: {
                    enabled: false,
                    isEmailSubscriber: false,
                    isSmsSubscriber: false,
                    tags: [],
                },
            },
            forms: {
                email: {
                    label: '',
                    cta: '',
                    disclaimerEnabled: true,
                    disclaimer: '',
                    preSelectDisclaimer: true,
                },
            },
            postSubmissionMessage: {
                enabled: false,
                message: '',
            },
        }
        const setState = (
            wrapped: (innerState: typeof state) => typeof state,
        ) => {
            const newState = wrapped(state)
            state.subscriberTypes = newState.subscriberTypes
            state.forms = newState.forms
            state.postSubmissionMessage = newState.postSubmissionMessage
        }

        const { getByPlaceholderText, getAllByPlaceholderText } = render(
            <Provider store={store}>
                <Customization
                    setNextButtonActive={jest.fn()}
                    setAttachmentData={setState as any}
                    attachmentData={state}
                />
            </Provider>,
        )
        const fieldLabelInputs = getAllByPlaceholderText('Email')
        const buttonLabelInput = getByPlaceholderText('Subscribe')

        await userEvent.type(fieldLabelInputs[0], 'Your email')
        expect(state.forms.email.label).toBe('Your email')
        await userEvent.type(buttonLabelInput, 'Subscribe now!')
        expect(state.forms.email.cta).toBe('Subscribe now!')
    })

    it('should render the thank you message', () => {
        const state = baseState
        const setState = (
            wrapped: (innerState: typeof state) => typeof state,
        ) => {
            const newState = wrapped(state)
            state.subscriberTypes = newState.subscriberTypes
            state.forms = newState.forms
            state.postSubmissionMessage = newState.postSubmissionMessage
        }

        const { getByText } = render(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={jest.fn()}
                    setAttachmentData={setState as any}
                    attachmentData={state}
                />
            </Provider>,
        )
        const toggleInput = getByText('Thank you message')
        act(() => toggleInput.click())
        expect(state.postSubmissionMessage.enabled).toBeTruthy()
    })

    it('should close when the collapse is called', () => {
        const mockOnOpenChange = jest.fn()
        const { getByText } = render(
            <Provider store={store}>
                <AddContactCaptureForm
                    open
                    onOpenChange={mockOnOpenChange}
                    onCancel={jest.fn()}
                    onSubmit={jest.fn()}
                    onReset={jest.fn()}
                />
            </Provider>,
        )
        act(() => getByText('keyboard_tab').click())
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should open when the toolbar icon is clicked', () => {
        const mockOnOpenChange = jest.fn()
        const { getByText } = render(
            <ContactFormCaptureFormIconButton
                onOpenChange={mockOnOpenChange}
                isDisabled={false}
            />,
        )
        act(() => getByText('wysiwyg').click())
        expect(mockOnOpenChange).toHaveBeenCalledWith(true)
    })

    it('should close when the backdrop area is clicked', async () => {
        const mockOnOpenChange = jest.fn()
        const { baseElement } = render(
            <Provider store={store}>
                <AddContactCaptureForm
                    open={true}
                    onOpenChange={mockOnOpenChange}
                    onCancel={jest.fn()}
                    onSubmit={jest.fn()}
                    onReset={jest.fn()}
                />
            </Provider>,
        )

        act(() =>
            userEvent.click(baseElement.getElementsByClassName('backdrop')[0]),
        )

        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        })
    })

    // TODO(React18): Fix this flaky test
    it.skip('should show error state when tags number is over 5 on setup', async () => {
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <AddContactCaptureForm open={true} onOpenChange={jest.fn()} />
            </Provider>,
        )
        const addTagsBtn = getByPlaceholderText('Add tags...')
        await userEvent.click(addTagsBtn)
        await userEvent.type(addTagsBtn, 'abc{enter}')
        await userEvent.type(addTagsBtn, 'def{enter}')
        await userEvent.type(addTagsBtn, 'ghi{enter}')
        await userEvent.type(addTagsBtn, 'jkl{enter}')
        await userEvent.type(addTagsBtn, 'mno{enter}')
        await userEvent.type(addTagsBtn, 'pqr{enter}')

        const nextBtn = getByText('Next')
        await waitFor(() => {
            expect(nextBtn).toBeDisabled()
            expect(
                getByText('You are allowed up to 5 tags.'),
            ).toBeInTheDocument()
        })
    })

    // TODO(React18): Fix this flaky test
    it.skip('should show error state when message is too long on post submission message step', async () => {
        const state = { ...baseState }
        state.postSubmissionMessage.message = 'f'.repeat(281)
        state.postSubmissionMessage.enabled = true
        const mockSetActiveButton = jest.fn()

        const { getByText } = render(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={mockSetActiveButton}
                    setAttachmentData={() => {}}
                    attachmentData={state}
                />
            </Provider>,
        )

        await waitFor(() => {
            expect(mockSetActiveButton).toHaveBeenCalledWith(false)
            expect(
                getByText(
                    'The message should be under or equals to 280 characters.',
                ),
            ).toBeInTheDocument()
        })
    })
})

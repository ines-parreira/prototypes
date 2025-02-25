import React from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'

import { UserRole } from 'config/types/user'
import { user } from 'fixtures/users'
import AddContactCaptureForm from 'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm'
import { ContactFormCaptureFormIconButton } from 'pages/convert/campaigns/components/ContactCaptureForm/ContactCaptureFormIconButton'
import { Customization } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/Customization'
import { PostSubmissionMessage } from 'pages/convert/campaigns/components/ContactCaptureForm/steps/PostSubmissionMessage'
import { useConvertGeneralSettings } from 'pages/stats/convert/hooks/useConvertGeneralSettings'
import useListTags from 'tags/useListTags'
import { mockQueryClient } from 'tests/reactQueryTestingUtils'
import { assumeMock } from 'utils/testing'

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

jest.mock('pages/stats/convert/hooks/useConvertGeneralSettings')
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

    it('should add tags in the first step and the next step should be available', async () => {
        const { getByText, getByPlaceholderText } = render(
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
        const addTagsBtn = getByPlaceholderText('Add tags...')
        act(() => addTagsBtn.click())
        await userEvent.type(addTagsBtn, 'Foo{enter}')
        const deleteTagBtn = getByText('Foo').nextElementSibling
        expect(deleteTagBtn).toBeInTheDocument()
        if (deleteTagBtn) fireEvent.click(deleteTagBtn)
        act(() => getByText('Next').click())
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

    it('should close when the backdrop area is clicked', () => {
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
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should show error state when tags number is over 5 on setup', async () => {
        const { getByPlaceholderText, getByText } = render(
            <Provider store={store}>
                <AddContactCaptureForm open={true} onOpenChange={jest.fn()} />
            </Provider>,
        )
        const addTagsBtn = getByPlaceholderText('Add tags...')
        act(() => addTagsBtn.click())
        await userEvent.type(addTagsBtn, 'abc{enter}')
        await userEvent.type(addTagsBtn, 'def{enter}')
        await userEvent.type(addTagsBtn, 'ghi{enter}')
        await userEvent.type(addTagsBtn, 'jkl{enter}')
        await userEvent.type(addTagsBtn, 'mno{enter}')
        await userEvent.type(addTagsBtn, 'pqr{enter}')
        const nextBtn = getByText('Next')
        expect(nextBtn).toBeDisabled()
        expect(getByText('You are allowed up to 5 tags.')).toBeInTheDocument()
    })

    it('should show error state when message is too long on post submission message step', () => {
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

        expect(mockSetActiveButton).toHaveBeenCalledWith(false)
        expect(
            getByText(
                'The message should be under or equals to 280 characters.',
            ),
        ).toBeInTheDocument()
    })
})

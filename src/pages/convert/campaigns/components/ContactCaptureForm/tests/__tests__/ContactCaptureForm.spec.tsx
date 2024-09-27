import React from 'react'
import configureMockStore from 'redux-mock-store'
import {act, render, screen, waitFor, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'

import AddContactCaptureForm from 'pages/convert/campaigns/components/ContactCaptureForm/AddContactCaptureForm'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import useListTags from 'tags/useListTags'
import {user} from 'fixtures/users'
import {UserRole} from 'config/types/user'
import {Customisation} from 'pages/convert/campaigns/components/ContactCaptureForm/steps/Customisation'
import {PostSubmissionMessage} from 'pages/convert/campaigns/components/ContactCaptureForm/steps/PostSubmissionMessage'
import {ContactFormCaptureFormIconButton} from 'pages/convert/campaigns/components/ContactCaptureForm/ContactCaptureFormIconButton'

jest.mock('tags/useListTags')
const mockStore = configureMockStore()

const queryClient = mockQueryClient()
const store = mockStore({
    currentUser: fromJS({
        ...user,
        role: {name: UserRole.Admin},
    }),
    integrations: fromJS({integrations: []}),
})
const mockUseListTags = useListTags as jest.Mock

describe('ContactForm test suite', () => {
    beforeEach(() => {
        mockUseListTags.mockReturnValue([])
    })

    it('should have the correct behavior for step navigation buttons', () => {
        const mockOnSubmit = jest.fn()
        const mockOnCancel = jest.fn()
        const mockOnReset = jest.fn()
        const {getByText} = render(
            <Provider store={store}>
                <AddContactCaptureForm
                    open
                    onOpenChange={() => {}}
                    onCancel={mockOnCancel}
                    onSubmit={mockOnSubmit}
                    onReset={mockOnReset}
                />
            </Provider>
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

        const resetButton = getByText('Reset')
        act(() => resetButton.click())
        expect(mockOnReset).toBeCalled()

        // Navigate back again to test back navigation
        previousButton = getByText('Previous')
        act(() => previousButton.click())
        previousButton = getByText('Previous')
        nextButton = getByText('Next')
        expect(previousButton).not.toBeUndefined()
        expect(nextButton).not.toBeUndefined()
    })

    it('should add tags in the first step and the next step should be available', async () => {
        const {getByText, getByPlaceholderText} = render(
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
            </Provider>
        )
        const addTagsBtn = getByText('Add tags')
        act(() => addTagsBtn.click())
        await waitFor(() =>
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        )
        const textField = getByPlaceholderText('Search')
        await userEvent.type(textField, 'Foo')
        await waitFor(() =>
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
        )
        act(() => getByText('Create').click())
        const deleteTagBtn = getByText('Foo').nextElementSibling
        expect(deleteTagBtn).toBeInTheDocument()
        if (deleteTagBtn) fireEvent.click(deleteTagBtn)
        act(() => getByText('Next').click())
    })

    it('should render the customisation step', async () => {
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
            wrapped: (innerState: typeof state) => typeof state
        ) => {
            const newState = wrapped(state)
            state.subscriberTypes = newState.subscriberTypes
            state.forms = newState.forms
            state.postSubmissionMessage = newState.postSubmissionMessage
        }

        const {getByPlaceholderText, getByText} = render(
            <Provider store={store}>
                <Customisation
                    setNextButtonActive={jest.fn()}
                    setAttachmentData={setState as any}
                    attachmentData={state}
                />
            </Provider>
        )
        const fieldLabelInput = getByPlaceholderText('Email')
        const buttonLabelInput = getByPlaceholderText('Subscribe')
        const enablePrivacyPolicyToggle = getByText(
            'Display privacy policy disclaimer'
        ) as HTMLInputElement
        const preSelectDisclaimerCheckbox = getByText(
            'Pre-select sign-up option'
        ) as HTMLInputElement

        await userEvent.type(fieldLabelInput, 'Your email')
        expect(state.forms.email.label).toBe('Your email')
        await userEvent.type(buttonLabelInput, 'Subscribe now!')
        expect(state.forms.email.cta).toBe('Subscribe now!')
        act(() => enablePrivacyPolicyToggle.click())
        expect(state.forms.email.disclaimerEnabled).toBeFalsy()
        act(() => preSelectDisclaimerCheckbox.click())
        expect(state.forms.email.preSelectDisclaimer).toBeFalsy()
    })

    it('should render the thank you message', () => {
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
            wrapped: (innerState: typeof state) => typeof state
        ) => {
            const newState = wrapped(state)
            state.subscriberTypes = newState.subscriberTypes
            state.forms = newState.forms
            state.postSubmissionMessage = newState.postSubmissionMessage
        }

        const {getByText} = render(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={jest.fn()}
                    setAttachmentData={setState as any}
                    attachmentData={state}
                />
            </Provider>
        )
        const toggleInput = getByText('Thank you message')
        act(() => toggleInput.click())
        expect(state.postSubmissionMessage.enabled).toBeTruthy()
    })

    it('should close when the collapse is called', () => {
        const mockOnOpenChange = jest.fn()
        const {getByText} = render(
            <Provider store={store}>
                <AddContactCaptureForm
                    open
                    onOpenChange={mockOnOpenChange}
                    onCancel={jest.fn()}
                    onSubmit={jest.fn()}
                    onReset={jest.fn()}
                />
            </Provider>
        )
        act(() => getByText('keyboard_tab').click())
        expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it('should open when the toolbar icon is clicked', () => {
        const mockOnOpenChange = jest.fn()
        const {getByText} = render(
            <ContactFormCaptureFormIconButton
                onOpenChange={mockOnOpenChange}
                isDisabled={false}
            />
        )
        act(() => getByText('wysiwyg').click())
        expect(mockOnOpenChange).toHaveBeenCalledWith(true)
    })
})

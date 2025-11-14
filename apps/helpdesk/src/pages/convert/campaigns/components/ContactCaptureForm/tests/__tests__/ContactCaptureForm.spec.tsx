import { assumeMock } from '@repo/testing'
import { QueryClientProvider } from '@tanstack/react-query'
import { screen, waitFor } from '@testing-library/react'
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
import { renderWithRouter } from 'utils/testing'

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

    it('displays an error when more than 5 tags are added', async () => {
        const user = userEvent.setup()

        renderWithRouter(
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
        await waitFor(() => expect(input).toBeInTheDocument())

        const tags = ['abc', 'def', 'ghi', 'jkl', 'mno', 'pqr']

        for (const tag of tags) {
            await user.type(input, `${tag}{enter}`)
        }

        await waitFor(() => {
            expect(
                screen.getByText('You are allowed up to 5 tags.'),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
        })
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

        const { getByText } = renderWithRouter(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={mockSetActiveButton}
                    setAttachmentData={() => {}}
                    attachmentData={state}
                />
            </Provider>,
        )

        await waitFor(() => {
            expect(
                getByText(
                    'The message should be under or equals to 280 characters.',
                ),
            ).toBeInTheDocument()
        })

        await waitFor(() => {
            expect(mockSetActiveButton).toHaveBeenCalledWith(false)
        })
    })

    it('should have the correct behavior for step navigation buttons', async () => {
        const user = userEvent.setup()
        const mockOnSubmit = jest.fn()
        const mockOnCancel = jest.fn()
        const { getByText } = renderWithRouter(
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

        const cancelBtn = getByText('Cancel')
        expect(cancelBtn).not.toBeUndefined()

        await user.click(cancelBtn)
        await waitFor(() => {
            expect(mockOnCancel).toHaveBeenCalled()
        })

        let nextButton = getByText('Next')

        await user.click(nextButton)
        await waitFor(() => {
            nextButton = getByText('Next')
            let previousButton = getByText('Previous')
            expect(previousButton).not.toBeUndefined()
            expect(nextButton).not.toBeUndefined()
        })

        await user.click(nextButton)
        await waitFor(() => {
            const submitButton = getByText('Add Form')
            const previousButton = getByText('Previous')
            expect(submitButton).not.toBeUndefined()
            expect(previousButton).not.toBeUndefined()
        })

        const submitButton = getByText('Add Form')
        await user.click(submitButton)
        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalled()
        })

        const previousButton = getByText('Previous')
        await user.click(previousButton)
        await waitFor(() => {
            const prevBtn = getByText('Previous')
            const nextBtn = getByText('Next')
            expect(prevBtn).not.toBeUndefined()
            expect(nextBtn).not.toBeUndefined()
        })
    })

    it('should add tags in the first step and the next step should be available', async () => {
        const user = userEvent.setup()
        renderWithRouter(
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

        await screen.findByText('Email Capture Form')
        const addTagsBtn = await screen.findByPlaceholderText('Add tags...')
        await waitFor(() => expect(addTagsBtn).toBeInTheDocument())

        await user.click(addTagsBtn)
        await user.type(addTagsBtn, 'Foo')
        await user.keyboard('{Enter}')

        await waitFor(() => {
            expect(screen.getByText('Foo')).toBeInTheDocument()
        })

        const tagElement = screen.getByText('Foo')
        const tagContainer = tagElement.closest('.tag')
        expect(tagContainer).toBeInTheDocument()

        const deleteButton = tagContainer?.querySelector('.closeIcon')
        expect(deleteButton).toBeInTheDocument()

        await user.click(deleteButton!)

        await waitFor(() => {
            expect(screen.queryByText('Foo')).not.toBeInTheDocument()
        })

        const nextButton = screen.getByRole('button', { name: 'Next' })
        await waitFor(() => {
            expect(nextButton).not.toBeDisabled()
        })
        await user.click(nextButton)

        await waitFor(() => {
            expect(screen.getByText('Previous')).toBeInTheDocument()
        })
    })

    it('should render the Customization step', async () => {
        const user = userEvent.setup()
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

        const { getByPlaceholderText, getAllByPlaceholderText } =
            renderWithRouter(
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

        await user.type(fieldLabelInputs[0], 'Your email')
        await waitFor(() => {
            expect(state.forms.email.label).toBe('Your email')
        })
        await user.type(buttonLabelInput, 'Subscribe now!')
        await waitFor(() => {
            expect(state.forms.email.cta).toBe('Subscribe now!')
        })
    })

    it('should render the thank you message component', () => {
        const { getByText, getByRole } = renderWithRouter(
            <Provider store={store}>
                <PostSubmissionMessage
                    setNextButtonActive={jest.fn()}
                    setAttachmentData={jest.fn()}
                    attachmentData={baseState}
                />
            </Provider>,
        )

        // Verify the toggle switch is rendered with the correct label
        expect(getByText('Thank you message')).toBeInTheDocument()
        expect(
            getByRole('switch', { name: /Thank you message/i }),
        ).toBeInTheDocument()

        // Verify the caption text is shown
        expect(
            getByText(
                'This is a message that appears once the customer has submitted their details.',
            ),
        ).toBeInTheDocument()
    })

    it('should close when the collapse is called', async () => {
        const user = userEvent.setup()
        const mockOnOpenChange = jest.fn()
        const { getByText } = renderWithRouter(
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
        await user.click(getByText('keyboard_tab'))
        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        })
    })

    it('should open when the toolbar icon is clicked', async () => {
        const user = userEvent.setup()
        const mockOnOpenChange = jest.fn()
        const { getByText } = renderWithRouter(
            <ContactFormCaptureFormIconButton
                onOpenChange={mockOnOpenChange}
                isDisabled={false}
            />,
        )
        await user.click(getByText('wysiwyg'))
        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(true)
        })
    })

    it('should close when the backdrop area is clicked', async () => {
        const user = userEvent.setup()
        const mockOnOpenChange = jest.fn()
        const { baseElement } = renderWithRouter(
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

        const backdrop = baseElement.getElementsByClassName('backdrop')[0]
        await user.click(backdrop)

        await waitFor(() => {
            expect(mockOnOpenChange).toHaveBeenCalledWith(false)
        })
    })
})

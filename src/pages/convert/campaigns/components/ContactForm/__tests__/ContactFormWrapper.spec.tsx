import React from 'react'
import configureMockStore from 'redux-mock-store'
import {act, render, screen, waitFor, fireEvent} from '@testing-library/react'
import {fromJS} from 'immutable'
import userEvent from '@testing-library/user-event'
import {QueryClientProvider} from '@tanstack/react-query'
import {Provider} from 'react-redux'

import ContactForm from 'pages/convert/campaigns/components/ContactForm/ContactFormWrapper'
import Wizard from 'pages/common/components/wizard/Wizard'
import {STEPS} from 'pages/convert/campaigns/components/ContactForm/steps'
import {mockQueryClient} from 'tests/reactQueryTestingUtils'
import useListTags from 'tags/useListTags'
import {user} from 'fixtures/users'
import {UserRole} from 'config/types/user'

jest.mock('tags/useListTags')
const mockStore = configureMockStore()
const queryClient = mockQueryClient()
const store = mockStore({
    currentUser: fromJS({
        ...user,
        role: {name: UserRole.Admin},
    }),
})
const mockUseListTags = useListTags as jest.Mock

describe('<ContactFormWrapper />', () => {
    beforeEach(() => {
        mockUseListTags.mockReturnValue([])
    })

    it('should have the correct behavior for step navigation buttons', () => {
        const mockOnSubmit = jest.fn()
        const mockOnCancel = jest.fn()
        const mockOnReset = jest.fn()
        const {getByText} = render(
            <Wizard steps={STEPS.map((step) => step.label)}>
                <ContactForm
                    open
                    onOpenChange={() => {}}
                    onCancel={mockOnCancel}
                    onSubmit={mockOnSubmit}
                    onReset={mockOnReset}
                />
            </Wizard>
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
                    <Wizard steps={STEPS.map((step) => step.label)}>
                        <ContactForm
                            open
                            onOpenChange={() => {}}
                            onCancel={jest.fn()}
                            onSubmit={jest.fn()}
                            onReset={jest.fn()}
                        />
                    </Wizard>
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
})

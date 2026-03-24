import type React from 'react'

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { fromJS } from 'immutable'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import type { UpdateSubjectLinesProps } from 'models/contactForm/types'
import { getSingleHelpCenterResponseFixture } from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import useCurrentHelpCenter from 'pages/settings/helpCenter/hooks/useCurrentHelpCenter'
import { HelpCenterTranslationProvider } from 'pages/settings/helpCenter/providers/HelpCenterTranslation/HelpCenterTranslation'
import { initialState as articlesState } from 'state/entities/helpCenter/articles/reducer'
import { initialState as categoriesState } from 'state/entities/helpCenter/categories/reducer'
import type { RootState, StoreDispatch } from 'state/types'
import { initialState as uiState } from 'state/ui/helpCenter/reducer'
import { renderWithRouter } from 'utils/testing'
import { DndProvider } from 'utils/wrappers/DndProvider'

import SubjectLines from '../SubjectLines'

jest.mock('lodash/uniqueId', () => {
    let value = 0

    return () => {
        value += 1
        return value.toString()
    }
})

jest.mock('pages/settings/helpCenter/hooks/useCurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture,
)
const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

jest.mock('pages/settings/contactForm/hooks/useContactFormApi', () => {
    return {
        useContactFormApi: () => ({
            isReady: true,
            isLoading: false,
            getContactFormById: jest.fn(),
        }),
    }
})

const defaultState: Partial<RootState> = {
    entities: {
        contactForm: {
            contactForms: {},
        },
        helpCenter: {
            helpCenters: {
                helpCentersById: {
                    '1': getSingleHelpCenterResponseFixture,
                },
            },
            articles: articlesState,
            categories: categoriesState,
        },
    } as any,
    integrations: fromJS({
        integrations: [],
    }),
    ui: { helpCenter: { ...uiState, currentId: 1 } } as any,
}

const DefaultProviders: React.FC<{ children?: React.ReactNode }> = ({
    children,
}) => (
    <Provider store={mockedStore(defaultState)}>
        <HelpCenterTranslationProvider
            helpCenter={getSingleHelpCenterResponseFixture}
        >
            {children}
        </HelpCenterTranslationProvider>
    </Provider>
)

const subjectLines = {
    allow_other: true,
    options: ['Option 1', 'Option 2', 'Option 3'],
}

const setIsDirty = jest.fn()

const renderComponent = (
    subjectLines: UpdateSubjectLinesProps,
    updateContactForm: React.Dispatch<
        React.SetStateAction<UpdateSubjectLinesProps>
    >,
) =>
    renderWithRouter(
        <DefaultProviders>
            <DndProvider backend={HTML5Backend}>
                <SubjectLines
                    title="Edit the subject of the contact form"
                    description="Here is a default list of subject lines. If there is no subject added, user can freely type any subject."
                    subjectLines={subjectLines}
                    setIsDirty={setIsDirty}
                    updateSubjectLines={updateContactForm}
                />
            </DndProvider>
        </DefaultProviders>,
    )

describe('<SubjectLines />', () => {
    it('should render the component and show the "Other" toggle', () => {
        const { container } = renderComponent(subjectLines, jest.fn)

        expect(
            screen.queryByText('Allow custom input using “Other”'),
        ).toBeTruthy()
        expect(container).toMatchSnapshot()
    })

    it('should render the component with no subject lines and hide the "Other" toggle', () => {
        const { container } = renderComponent(
            {
                allow_other: true,
                options: [],
            },
            jest.fn,
        )

        expect(
            screen.queryByText('Allow custom input using “Other”'),
        ).toBeFalsy()
        expect(container).toMatchSnapshot()
    })

    it('should call the updateContactForm function when the "Other" toggle is clicked', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        const checkbox = screen.getByText('Allow custom input using “Other”')
        checkbox.click()

        expect(updateContactForm).toHaveBeenCalled()
        expect(checkbox).not.toBeChecked()
        expect(setIsDirty).toHaveBeenCalledWith(true)
    })

    it('should call the updateContactForm function when a subject line is added', async () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        screen.getByText(/add subject line/i).click()

        await waitFor(() => {
            expect(updateContactForm).toHaveBeenCalled()
            expect(screen.getAllByRole('textbox').length).toBe(4)
            expect(screen.getAllByRole('textbox')[3].nodeValue).toBe(null)
            expect(setIsDirty).toHaveBeenCalledWith(true)
        })
    })

    it('should call the updateContactForm function when a subject line is removed', async () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        screen.getAllByText(/delete/i)[0].click()

        await waitFor(() => {
            expect(updateContactForm).toHaveBeenCalled()
            expect(screen.getAllByRole('textbox').length).toBe(2)
            expect(setIsDirty).toHaveBeenCalledWith(true)
        })
    })

    it('should call the updateContactForm function when a subject line is updated', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        const firstInput = screen.getAllByRole('textbox')[0]
        firstInput.focus()
        fireEvent.change(firstInput, { target: { value: 'New subject line' } })
        firstInput.blur()

        expect(updateContactForm).toHaveBeenCalled()
        expect(firstInput).toHaveValue('New subject line')
        expect(setIsDirty).toHaveBeenCalledWith(true)
    })

    it('should call the updateContactForm function when a subject line is reordered', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        const firstDragElement = screen.getAllByText('drag_indicator')[0]
        const secondDragElement = screen.getAllByText('drag_indicator')[1]

        firstDragElement.focus()
        firstDragElement.dispatchEvent(
            new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
            }),
        )
        secondDragElement.dispatchEvent(
            new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
            }),
        )
        secondDragElement.dispatchEvent(
            new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
            }),
        )

        // wait for the reordering animation to finish
        setTimeout(() => {
            expect(updateContactForm).toHaveBeenCalled()
            expect(screen.getAllByRole('textbox')[0]).toHaveValue('Option 2')
            expect(screen.getAllByRole('textbox')[1]).toHaveValue('Option 1')
            expect(setIsDirty).toHaveBeenCalledWith(true)
        })
    })
})

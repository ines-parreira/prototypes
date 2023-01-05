import React, {FC} from 'react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'
import {Provider} from 'react-redux'
import {HTML5Backend} from 'react-dnd-html5-backend'
import {DndProvider} from 'react-dnd'
import {fireEvent, screen} from '@testing-library/react'
import {RootState, StoreDispatch} from 'state/types'

import {renderWithRouter} from 'utils/testing'
import {getSingleHelpCenterResponseFixture} from 'pages/settings/helpCenter/fixtures/getHelpCentersResponse.fixture'
import {initialState as articlesState} from 'state/entities/helpCenter/articles/reducer'
import {initialState as categoriesState} from 'state/entities/helpCenter/categories/reducer'
import {initialState as uiState} from 'state/ui/helpCenter/reducer'
import {HelpCenterTranslationProvider} from 'pages/settings/helpCenter/providers/HelpCenterTranslation'
import {useCurrentHelpCenter} from 'pages/settings/helpCenter/providers/CurrentHelpCenter'
import {UpdateContactForm} from 'models/helpCenter/types'
import SubjectLines from '../SubjectLines'

jest.mock('lodash/uniqueId', () => {
    let value = 0

    return () => {
        value += 1
        return value.toString()
    }
})

jest.mock('pages/settings/helpCenter/providers/CurrentHelpCenter')
;(useCurrentHelpCenter as jest.Mock).mockReturnValue(
    getSingleHelpCenterResponseFixture
)
const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
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
    ui: {helpCenter: {...uiState, currentId: 1}} as any,
}

const DefaultProviders: FC = ({children}) => (
    <Provider store={mockedStore(defaultState)}>
        <HelpCenterTranslationProvider
            helpCenter={getSingleHelpCenterResponseFixture}
        >
            {children}
        </HelpCenterTranslationProvider>
    </Provider>
)

const subjectLines = {
    'en-US': {
        allow_other: true,
        options: ['Option 1', 'Option 2', 'Option 3'],
    },
}

const setIsDirty = jest.fn()

const renderComponent = (
    subjectLines: UpdateContactForm['subject_lines'],
    updateContactForm: React.Dispatch<React.SetStateAction<UpdateContactForm>>
) =>
    renderWithRouter(
        <DefaultProviders>
            <DndProvider backend={HTML5Backend}>
                <SubjectLines
                    contactForm={{
                        helpdesk_integration_email: 'irinel@gorgias.com',
                        helpdesk_integration_id: 123,
                        card_enabled: true,
                        subject_lines: subjectLines,
                    }}
                    setIsDirty={setIsDirty}
                    translationsLoaded={true}
                    helpCenter={getSingleHelpCenterResponseFixture}
                    currentLocale="en-US"
                    updateContactForm={updateContactForm}
                />
            </DndProvider>
        </DefaultProviders>
    )

describe('<SubjectLines />', () => {
    it('should render the component and show the "Other" toggle', () => {
        const {container} = renderComponent(subjectLines, jest.fn)

        expect(
            screen.queryByText('Allow custom input using “Other”')
        ).toBeTruthy()
        expect(container).toMatchSnapshot()
    })

    it('should render the component with no subject lines and hide the "Other" toggle', () => {
        const {container} = renderComponent(
            {
                'en-US': {
                    allow_other: true,
                    options: [],
                },
            },
            jest.fn
        )

        expect(
            screen.queryByText('Allow custom input using “Other”')
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

    it('should call the updateContactForm function when a subject line is added', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        screen.getByText(/add subject line/i).click()

        expect(updateContactForm).toHaveBeenCalled()
        expect(screen.getAllByRole('textbox').length).toBe(4)
        expect(screen.getAllByRole('textbox')[3].nodeValue).toBe(null)
        expect(setIsDirty).toHaveBeenCalledWith(true)
    })

    it('should call the updateContactForm function when a subject line is removed', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        screen.getAllByText(/delete/i)[0].click()

        expect(updateContactForm).toHaveBeenCalled()
        expect(screen.getAllByRole('textbox').length).toBe(2)
        expect(setIsDirty).toHaveBeenCalledWith(true)
    })

    it('should call the updateContactForm function when a subject line is updated', () => {
        const updateContactForm = jest.fn()
        renderComponent(subjectLines, updateContactForm)

        const firstInput = screen.getAllByRole('textbox')[0]
        firstInput.focus()
        fireEvent.change(firstInput, {target: {value: 'New subject line'}})
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
            })
        )
        secondDragElement.dispatchEvent(
            new MouseEvent('mousemove', {
                bubbles: true,
                cancelable: true,
            })
        )
        secondDragElement.dispatchEvent(
            new MouseEvent('mouseup', {
                bubbles: true,
                cancelable: true,
            })
        )

        expect(updateContactForm).toHaveBeenCalled()
        // wait for the reordering animation to finish
        setTimeout(() => {
            expect(screen.getAllByRole('textbox')[0]).toHaveValue('Option 2')
            expect(screen.getAllByRole('textbox')[1]).toHaveValue('Option 1')
            expect(setIsDirty).toHaveBeenCalledWith(true)
        })
    })
})

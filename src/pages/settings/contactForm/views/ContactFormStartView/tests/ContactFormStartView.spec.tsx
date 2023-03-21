import {fireEvent, screen} from '@testing-library/react'
import {createMemoryHistory} from 'history'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {RootState, StoreDispatch} from 'state/types'
import {assumeMock, renderWithRouter} from 'utils/testing'
import {HELP_CENTER_BASE_PATH} from 'pages/settings/helpCenter/constants'
import {
    CONTACT_FORM_ABOUT_PATH,
    CONTACT_FORM_CREATE_PATH,
    CONTACT_FORM_FORMS_PATH,
} from 'pages/settings/contactForm/constants'
import {usePaginatedContactForms} from 'pages/settings/contactForm/hooks/usePaginatedContactForms'
import {CONTACT_FORM_APP_DETAIL} from 'pages/settings/contactForm/views/ContactFormStartView/constants'
import ContactFormStartView from 'pages/settings/contactForm/views/ContactFormStartView/ContactFormStartView'
import {ContactFormFixture} from 'pages/settings/contactForm/fixtures/contacForm'

jest.mock('../../../hooks/usePaginatedContactForms')
const mockedUsePaginatedContactForms = assumeMock(usePaginatedContactForms)
const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])

describe('<ContactFormStartView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()

        mockedUsePaginatedContactForms.mockReturnValue({
            contactForms: [],
            isLoading: false,
            fetchMore: jest.fn(),
            hasMore: false,
        })
    })

    describe('Navigation', () => {
        it('should display Navigation bar links correctly', () => {
            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>
            )

            const aboutNavLink = screen.getByRole('link', {name: 'About'})
            const formsNavLink = screen.getByRole('link', {name: 'Forms'})

            expect(aboutNavLink).toHaveAttribute(
                'href',
                CONTACT_FORM_ABOUT_PATH
            )
            expect(formsNavLink).toHaveAttribute(
                'href',
                CONTACT_FORM_FORMS_PATH
            )
        })

        it('should navigate to `About` section when there is no created CFs', () => {
            const history = createMemoryHistory({
                initialEntries: [HELP_CENTER_BASE_PATH],
            })

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {history}
            )

            expect(history.location.pathname).toEqual(CONTACT_FORM_ABOUT_PATH)
        })

        it('should navigate to `Forms` section when there is at least 1 created CF', () => {
            const history = createMemoryHistory({
                initialEntries: [HELP_CENTER_BASE_PATH],
            })
            mockedUsePaginatedContactForms.mockReturnValue({
                isLoading: false,
                fetchMore: jest.fn(),
                hasMore: false,
                contactForms: [ContactFormFixture],
            })

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {history}
            )

            expect(history.location.pathname).toEqual(CONTACT_FORM_FORMS_PATH)
        })
    })

    describe('`About` section', () => {
        it('should display description', () => {
            const {container} = renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {
                    route: CONTACT_FORM_ABOUT_PATH,
                }
            )

            screen.getByText(CONTACT_FORM_APP_DETAIL.description)

            expect(container).toMatchSnapshot()
        })

        it('should display `Create Contact Form` button', () => {
            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {
                    route: CONTACT_FORM_ABOUT_PATH,
                }
            )

            const createButtonHref = screen
                .getByRole('button', {name: /Create Contact Form/})
                .closest('a')
                ?.getAttribute('to')

            expect(createButtonHref).toMatch(`${CONTACT_FORM_CREATE_PATH}`)
        })
    })

    describe('`Forms` section', () => {
        it('should render ManageContactForms component empty state', () => {
            const {container} = renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {route: CONTACT_FORM_FORMS_PATH}
            )

            screen.getByText('You have no contact forms at the moment.')

            expect(container).toMatchSnapshot()
        })

        it('should display `Create Form` button in the container when there is no forms', () => {
            mockedUsePaginatedContactForms.mockReturnValue({
                isLoading: false,
                fetchMore: jest.fn(),
                hasMore: false,
                contactForms: [],
            })

            const history = createMemoryHistory({
                initialEntries: [CONTACT_FORM_FORMS_PATH],
            })

            jest.spyOn(history, 'push')

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {history}
            )

            const createButton = screen.getByLabelText('create-form-bottom')

            fireEvent.click(createButton)

            expect(history.push).toHaveBeenLastCalledWith(
                CONTACT_FORM_CREATE_PATH
            )
        })

        it('should display `Create Form` button in the header when there is at least one form', () => {
            mockedUsePaginatedContactForms.mockReturnValue({
                contactForms: [ContactFormFixture],
                isLoading: false,
                fetchMore: jest.fn(),
                hasMore: false,
            })

            const history = createMemoryHistory({
                initialEntries: [CONTACT_FORM_FORMS_PATH],
            })

            jest.spyOn(history, 'push')

            renderWithRouter(
                <Provider store={mockStore({})}>
                    <ContactFormStartView />,
                </Provider>,
                {history}
            )

            const createButton = screen.getByLabelText('create-form-nav')

            fireEvent.click(createButton)

            expect(history.push).toHaveBeenLastCalledWith(
                CONTACT_FORM_CREATE_PATH
            )
        })
    })
})

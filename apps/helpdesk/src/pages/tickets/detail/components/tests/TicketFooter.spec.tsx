import React from 'react'

import { render } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import useAppDispatch from 'hooks/useAppDispatch'
import useAppSelector from 'hooks/useAppSelector'
import Editor from 'pages/common/editor/Editor'
import useInitialMacroFilters from 'pages/common/editor/hooks/useInitialMacroFilters'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import { editorFocused } from 'state/ui/editor/actions'

import TicketFooter from '../TicketFooter'
import TypingActivity from '../TypingActivity'

jest.mock('hooks/useAppDispatch', () => jest.fn())
jest.mock('hooks/useAppSelector', () => jest.fn())
jest.mock('pages/common/editor/Editor', () => jest.fn(() => <p>Editor</p>))
jest.mock('pages/common/editor/hooks/useInitialMacroFilters', () => jest.fn())
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))
jest.mock('state/ui/editor/actions', () => ({ editorFocused: jest.fn() }))
jest.mock('../TypingActivity', () => jest.fn(() => <p>TypingActivity</p>))
jest.mock(
    'pages/integrations/integration/components/whatsapp/WhatsAppEditorProvider',
    () => jest.fn(({ children }: any) => <div>{children}</div>),
)

const mockEditor = Editor as jest.Mock
const mockEditorFocused = editorFocused as unknown as jest.Mock
const mockUseAppDispatch = useAppDispatch as jest.Mock
const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseInitialMacroFilters = useInitialMacroFilters as jest.Mock
const mockUseStandaloneAiAccess = useStandaloneAiAccess as jest.Mock

const mockStore = configureMockStore([thunk])

const defaultState = {
    currentUser: fromJS({}),
    ticket: fromJS({}),
}

describe('<TicketFooter />', () => {
    let dispatch: jest.Mock

    const isShopperTyping = false
    const shopperName = 'chiel'
    const submit = jest.fn()
    const defaultContext = { isShopperTyping, shopperName, submit }

    beforeEach(() => {
        jest.restoreAllMocks()

        dispatch = jest.fn()
        mockUseAppDispatch.mockReturnValue(dispatch)
        mockUseAppSelector.mockReturnValue({ id: 1 })
        mockUseInitialMacroFilters.mockReturnValue({ languages: ['en'] })
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
        mockEditorFocused.mockImplementation((focused: boolean) => ({
            focused,
        }))
    })

    it('should not render anything if no context is given', () => {
        const { container } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should pass the given context down to the correct components', () => {
        const { getByText } = render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        expect(getByText('TypingActivity')).toBeInTheDocument()
        expect(getByText('Editor')).toBeInTheDocument()
        expect(TypingActivity).toHaveBeenCalledWith(
            { isTyping: isShopperTyping, name: shopperName },
            expect.objectContaining({}),
        )
        expect(mockEditor).toHaveBeenCalledWith(
            {
                canEdit: true,
                internalNotesOnly: false,
                submit,
                initialMacroFilters: { languages: ['en'] },
                onBlur: expect.any(Function),
                onFocus: expect.any(Function),
                ticket: { id: 1 },
            },
            expect.objectContaining({}),
        )
    })

    it('should allow only internal notes for standalone ai agents without write access', () => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                ticketsView: {
                    canCreateInternalNote: true,
                    canWrite: false,
                },
            }),
        )

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        expect(mockEditor).toHaveBeenCalledWith(
            expect.objectContaining({
                canEdit: true,
                internalNotesOnly: true,
            }),
            expect.objectContaining({}),
        )
    })

    it('should allow public replies for standalone ai agents with write access', () => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                ticketsView: {
                    canCreateInternalNote: false,
                    canWrite: true,
                },
            }),
        )

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        expect(mockEditor).toHaveBeenCalledWith(
            expect.objectContaining({
                canEdit: true,
                internalNotesOnly: false,
            }),
            expect.objectContaining({}),
        )
    })

    it('should disable the editor for standalone ai agents without reply permissions', () => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
                ticketsView: {
                    canCreateInternalNote: false,
                    canWrite: false,
                },
            }),
        )

        render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        expect(mockEditor).toHaveBeenCalledWith(
            expect.objectContaining({
                canEdit: false,
                internalNotesOnly: false,
            }),
            expect.objectContaining({}),
        )
    })

    it('should dispatch editorFocused with true when onFocus is called', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        const { onFocus } = (
            mockEditor.mock.calls.pop() as [{ onFocus: () => void }]
        )[0]

        onFocus()

        expect(mockEditorFocused).toHaveBeenCalledWith(true)
        expect(dispatch).toHaveBeenCalledWith({ focused: true })
    })

    it('should dispatch editorFocused with false when onBlur is called', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <TicketFooter context={defaultContext} />
            </Provider>,
        )

        const { onBlur } = (
            mockEditor.mock.calls.pop() as [{ onBlur: () => void }]
        )[0]

        onBlur()

        expect(mockEditorFocused).toHaveBeenCalledWith(false)
        expect(dispatch).toHaveBeenCalledWith({ focused: false })
    })
})

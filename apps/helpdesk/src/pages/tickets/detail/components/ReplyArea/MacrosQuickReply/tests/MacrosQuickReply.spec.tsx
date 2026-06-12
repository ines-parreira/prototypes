import { render } from '@repo/testing'
import { fireEvent } from '@testing-library/react'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import { account } from 'fixtures/account'
import {
    addTagsAction,
    httpAction,
    macroFixture,
    setTextAction,
    shopifyAction,
} from 'fixtures/macro'
import { createMockStandaloneAiAccess } from 'fixtures/standaloneAiAccess'
import { ticket } from 'fixtures/ticket'
import { user } from 'fixtures/users'
import { useStandaloneAiContext as useStandaloneAiAccess } from 'providers/standalone-ai/StandaloneAiContext'
import type { RootState, StoreDispatch } from 'state/types'

import { MacrosQuickReply } from '../MacrosQuickReply'

jest.mock('@gorgias/toolkit', () => ({
    ...jest.requireActual('@gorgias/toolkit'),
    debounce: (() => {
        const _identity: <T>(v: T) => T =
            jest.requireActual('@gorgias/toolkit').identity
        return _identity
    })(),
}))
jest.mock('pages/tickets/common/macros/Preview/Preview', () => ({
    Preview: () => <>Preview</>,
}))
jest.mock('providers/standalone-ai/StandaloneAiContext', () => ({
    useStandaloneAiContext: jest.fn(() => createMockStandaloneAiAccess()),
}))

const applyMacro = jest.fn()
const mockUseStandaloneAiAccess = useStandaloneAiAccess as jest.Mock

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([thunk])
describe('<MacrosQuickReply />', () => {
    const minProps = {
        macros: [
            [setTextAction],
            [shopifyAction, addTagsAction, httpAction],
            [setTextAction, shopifyAction, addTagsAction, httpAction],
        ].map((actions, i) => ({
            ...macroFixture,
            actions: actions,
            name: `macro-${i}`,
            id: i + 1,
        })),
        applyMacro,
    }
    const state: Partial<RootState> = {
        currentUser: fromJS(user),
        currentAccount: fromJS(account),
        ticket: fromJS(ticket),
    }

    const store = mockStore(state)

    beforeEach(() => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess(),
        )
        applyMacro.mockClear()
    })

    it('should render the macros quick reply area', () => {
        const { getByText, getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />{' '}
            </Provider>,
        )

        expect(getByText('Suggested macros')).toBeInTheDocument()
        expect(getByText('info_outline')).toBeInTheDocument()

        const buttons = getAllByRole('button')
        expect(buttons).toHaveLength(3)

        expect(getByText('macro-0')).toBeInTheDocument()
        expect(getByText('macro-1')).toBeInTheDocument()
        expect(getByText('macro-2')).toBeInTheDocument()
    })

    it('should not render the macros quick reply area for standalone ai agents', () => {
        mockUseStandaloneAiAccess.mockReturnValue(
            createMockStandaloneAiAccess({
                isStandaloneAiAgent: true,
            }),
        )

        const { container } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )

        expect(container).toBeEmptyDOMElement()
    })

    it('should show the tooltip when hovering on the icon', async () => {
        const { getByText, findByText } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} />
            </Provider>,
        )
        fireEvent.mouseOver(getByText('info_outline'))

        const tooltip = await findByText('Macros are suggested', {
            exact: false,
        })

        expect(tooltip).toHaveTextContent(
            'Macros are suggested based on your previous macro usage.',
        )
        expect(tooltip).toHaveTextContent(
            'Use macros to save time answering tickets.',
        )
    })

    it('should filter out macros without an ID', () => {
        const macrosWithInvalidId = [
            ...minProps.macros,
            {
                ...macroFixture,
                actions: [setTextAction],
                name: 'macro-without-id',
                id: undefined,
            },
        ]
        const { getAllByRole } = render(
            <Provider store={store}>
                <MacrosQuickReply {...minProps} macros={macrosWithInvalidId} />
            </Provider>,
        )

        expect(getAllByRole('button')).toHaveLength(3)
    })
})

import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {createEvent, fireEvent, render} from '@testing-library/react'

import {FORM_CONTENT_TYPE} from 'config'
import {MacroActionName} from 'models/macroAction/types'

import {FeatureFlagKey} from 'config/featureFlags'
import {getLDClient} from 'utils/launchDarkly'
import {TicketReplyActionContainer} from '../TicketReplyAction'

jest.mock('lodash/debounce', () => (fn: (...args: any[]) => void) => fn)

jest.mock('utils/launchDarkly')
const allFlagsMock = getLDClient().allFlags as jest.Mock
allFlagsMock.mockReturnValue({[FeatureFlagKey.ChatVideoSharingExtra]: true})

describe('<TicketReplyAction />', () => {
    const mockStore = configureMockStore([thunk])
    const minProps = {
        action: fromJS({
            name: MacroActionName.AddInternalNote,
            arguments: {},
        }),
        index: 1,
        remove: jest.fn(),
        ticketId: 1,
        updateActionArgsOnApplied: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should call updateActionArgsOnApplied when the internal note is updated', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <TicketReplyActionContainer {...minProps} />
            </Provider>
        )
        const editor = container.querySelector('.public-DraftEditor-content')!
        const event = createEvent.paste(editor, {
            clipboardData: {
                types: ['text/plain'],
                getData: () => 'hello',
            },
        })

        fireEvent(editor, event)
        fireEvent(editor, event)

        expect(minProps.updateActionArgsOnApplied).toHaveBeenCalledTimes(3)
    })

    it('should call updateActionArgsOnApplied when the dict argument is updated', () => {
        const {getByDisplayValue} = render(
            <Provider store={mockStore({})}>
                <TicketReplyActionContainer
                    {...minProps}
                    action={fromJS({
                        name: MacroActionName.Http,
                        arguments: {
                            content_type: FORM_CONTENT_TYPE,
                            form: [
                                {
                                    editable: true,
                                    key: 'foo',
                                    value: 'bar',
                                },
                            ],
                        },
                    })}
                />
            </Provider>
        )

        fireEvent.change(getByDisplayValue(/bar/), {target: {value: 'baz'}})

        expect(minProps.updateActionArgsOnApplied).toHaveBeenNthCalledWith(
            1,
            1,
            fromJS({
                content_type: FORM_CONTENT_TYPE,
                form: [
                    {
                        editable: true,
                        key: 'foo',
                        value: 'baz',
                    },
                ],
            }),
            1
        )
    })

    it('should call updateActionArgsOnApplied when the argument is updated', () => {
        const {queryAllByRole} = render(
            <Provider store={mockStore({})}>
                <TicketReplyActionContainer
                    {...minProps}
                    action={fromJS({
                        name: MacroActionName.ShopifyCancelLastOrder,
                        arguments: {
                            restock: true,
                            refund: true,
                        },
                    })}
                />
            </Provider>
        )

        fireEvent.click(queryAllByRole('checkbox')![0])

        expect(minProps.updateActionArgsOnApplied).toHaveBeenNthCalledWith(
            1,
            1,
            fromJS({
                restock: false,
                refund: true,
            }),
            1
        )
    })
})

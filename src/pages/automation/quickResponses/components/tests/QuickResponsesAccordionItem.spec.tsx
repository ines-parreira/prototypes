import React from 'react'
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import {fromJS} from 'immutable'

import {getLDClient} from 'utils/launchDarkly'
import {RootState, StoreDispatch} from 'state/types'

import QuickResponsesViewContext from '../../QuickResponsesViewContext'
import QuickResponsesAccordionItem from '../QuickResponsesAccordionItem'

jest.mock('utils/launchDarkly')

const allFlagsMock = getLDClient().allFlags as jest.MockedFunction<
    ReturnType<typeof getLDClient>['allFlags']
>
allFlagsMock.mockReturnValue({})

const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

describe('<QuickResponsesAccordionItem />', () => {
    it('should deactivate the quick response', () => {
        const item = {
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            deactivated_datetime: null,
            title: 'How do I choose the right size?',
            response_message_content: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }
        const onToggleMock = jest.fn()

        render(
            <Provider store={mockStore()}>
                <QuickResponsesAccordionItem
                    item={item}
                    onPreviewChange={jest.fn()}
                    onDelete={jest.fn()}
                    onToggle={onToggleMock}
                />
            </Provider>
        )

        const toggleInput = screen.getByRole('switch')

        act(() => {
            fireEvent.click(toggleInput)
        })

        expect(onToggleMock).toBeCalledWith(item.id, expect.any(String))
    })

    it('should activate the quick response', () => {
        const item = {
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            deactivated_datetime: '2021-01-15T15:26:02.575404+00:00',
            title: 'How do I choose the right size?',
            response_message_content: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }
        const onToggleMock = jest.fn()

        render(
            <Provider store={mockStore()}>
                <QuickResponsesAccordionItem
                    item={item}
                    onPreviewChange={jest.fn()}
                    onDelete={jest.fn()}
                    onToggle={onToggleMock}
                />
            </Provider>
        )

        const toggleInput = screen.getByRole('switch')

        act(() => {
            fireEvent.click(toggleInput)
        })

        expect(onToggleMock).toBeCalledWith(item.id, null)
    })

    it('should delete the quick response', () => {
        const item = {
            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
            deactivated_datetime: null,
            title: 'How do I choose the right size?',
            response_message_content: {
                html: '',
                text: '',
                attachments: fromJS([]),
            },
        }
        const onDeleteMock = jest.fn()

        render(
            <Provider store={mockStore()}>
                <QuickResponsesAccordionItem
                    item={item}
                    onPreviewChange={jest.fn()}
                    onDelete={onDeleteMock}
                    onToggle={jest.fn()}
                />
            </Provider>
        )

        const deleteButton = screen.getByText('Delete')

        act(() => {
            fireEvent.click(deleteButton)
        })

        const confirmButton = within(
            screen.getByText('Deleting this quick response cannot be undone.')
                .parentElement!
        ).getByText('Delete')

        act(() => {
            fireEvent.click(confirmButton)
        })

        expect(onDeleteMock).toBeCalledWith(item.id)
    })

    it('should display tooltip if quick responses limit was reached', async () => {
        render(
            <Provider store={mockStore()}>
                <QuickResponsesViewContext.Provider
                    value={{
                        isUpdatePending: false,
                        hasError: false,
                        setError: jest.fn(),
                        isLimitReached: true,
                        storeIntegration: undefined,
                    }}
                >
                    <QuickResponsesAccordionItem
                        item={{
                            id: 'ded6b39b-a85c-487e-8658-3f380d238528',
                            deactivated_datetime:
                                '2021-01-15T15:26:02.575404+00:00',
                            title: 'How do I choose the right size?',
                            response_message_content: {
                                html: '',
                                text: '',
                                attachments: fromJS([]),
                            },
                        }}
                        onPreviewChange={jest.fn()}
                        onDelete={jest.fn()}
                        onToggle={jest.fn()}
                    />
                </QuickResponsesViewContext.Provider>
            </Provider>
        )

        const tooltipInput = screen.getByRole('switch')

        act(() => {
            fireEvent.mouseEnter(tooltipInput)
        })

        await waitFor(() => {
            expect(
                screen.getByText(
                    'There are already 6 active quick response flows and/or flows. Disable one of them to activate this one.'
                )
            ).toBeVisible()
        })
    })
})

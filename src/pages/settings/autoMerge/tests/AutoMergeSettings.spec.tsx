import React from 'react'

import { fireEvent, render, screen } from '@testing-library/react'
import { createMemoryHistory } from 'history'
import { fromJS } from 'immutable'
import { Provider } from 'react-redux'
import { Router } from 'react-router-dom'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import AutoMergeSettings from 'pages/settings/autoMerge/AutoMergeSettings'
import { submitSetting } from 'state/currentAccount/actions'
import { AccountSettingType } from 'state/currentAccount/types'
import { userEvent } from 'utils/testing/userEvent'

jest.mock('state/currentAccount/actions')

const submitSettingMock = (
    submitSetting as jest.MockedFunction<typeof submitSetting>
).mockReturnValue(() => Promise.resolve())

const autoMergeAccountSetting = {
    id: 1,
    type: AccountSettingType.AutoMerge,
    data: {
        tickets: {
            enabled: true,
            merging_window_days: 13,
        },
    },
}
const store = configureMockStore([thunk])({
    currentAccount: fromJS({
        settings: [autoMergeAccountSetting],
    }),
})

const history = createMemoryHistory()

describe('AutoMergeSettings', () => {
    it('should render out a form with a checkbox (`[] Auto-merge tickets`) and a label with a number input spinner (`Maximum difference between ticket creation dates`)', () => {
        const { getByText, getByRole } = render(
            <Router history={history}>
                <Provider store={store}>
                    <AutoMergeSettings />
                </Provider>
            </Router>,
        )

        expect(getByText('Auto-merge tickets')).toBeInTheDocument()

        expect(
            getByText('Maximum difference between ticket creation dates:'),
        ).toBeInTheDocument()
        expect(
            getByText('Maximum difference between ticket creation dates:'),
        ).not.toHaveClass('isDisabled')
        expect(getByRole('checkbox')).toBeInTheDocument()

        expect(getByRole('spinbutton')).toBeInTheDocument()
        expect(getByRole('spinbutton')).not.toHaveClass('isDisabled')
    })

    it('should render out a disabled label with a disabled number input spinner (`Maximum difference between ticket creation dates`)', () => {
        const { getByText, getByRole } = render(
            <Router history={history}>
                <Provider
                    store={configureMockStore([thunk])({
                        currentAccount: fromJS({
                            settings: [
                                {
                                    ...autoMergeAccountSetting,
                                    data: {
                                        tickets: {
                                            enabled: false,
                                            merging_window_days: 13,
                                        },
                                    },
                                },
                            ],
                        }),
                    })}
                >
                    <AutoMergeSettings />
                </Provider>
            </Router>,
        )

        expect(
            getByText('Maximum difference between ticket creation dates:'),
        ).toHaveClass('isDisabled')
        expect(getByRole('spinbutton')).toHaveClass('isDisabled')
    })

    it('should call the `submitSettings` function when the form is submitted', () => {
        const { getByText } = render(
            <Router history={history}>
                <Provider store={store}>
                    <AutoMergeSettings />
                </Provider>
            </Router>,
        )

        userEvent.click(getByText('Auto-merge tickets'))
        fireEvent.change(screen.getByRole('spinbutton'), {
            target: { value: 21 },
        })

        userEvent.click(getByText('Save Changes'))

        expect(submitSettingMock).toHaveBeenCalledWith({
            ...autoMergeAccountSetting,
            data: {
                tickets: {
                    enabled: false,
                    merging_window_days: 21,
                },
            },
        })
    })
})

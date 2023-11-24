import React from 'react'
import {fireEvent, render, screen} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {fromJS} from 'immutable'

import {
    DrillDownDownloadButton,
    DOWNLOAD_REQUESTED_LABEL,
} from 'pages/stats/DrillDownDownloadButton'
import {RootState} from 'state/types'
import {agents} from 'fixtures/agents'
import {UserRole} from 'config/types/user'
import {NotificationStatus} from 'state/notifications/types'

const mockStore = configureMockStore([thunk])

describe('<DrillDownDownloadButton />', () => {
    const defaultState = {
        currentUser: fromJS(agents[0]),
    } as unknown as RootState

    it('should render button', () => {
        render(
            <Provider store={mockStore(defaultState)}>
                <DrillDownDownloadButton />
            </Provider>
        )

        expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should render disabled button', () => {
        render(
            <Provider
                store={mockStore({
                    currentUser: fromJS({
                        ...agents[0],
                        role: {name: UserRole.ObserverAgent},
                    }),
                } as unknown as RootState)}
            >
                <DrillDownDownloadButton />
            </Provider>
        )

        expect(screen.getByRole('button')).toHaveClass('isDisabled')
    })

    it('should notify use after button click', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownDownloadButton />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))

        expect(store.getActions()).toMatchObject([
            {
                payload: {
                    status: NotificationStatus.Success,
                },
            },
        ])
    })

    it('should render requested label after button click', () => {
        const store = mockStore(defaultState)
        render(
            <Provider store={store}>
                <DrillDownDownloadButton />
            </Provider>
        )

        fireEvent.click(screen.getByRole('button'))

        expect(screen.getByText(DOWNLOAD_REQUESTED_LABEL)).toBeInTheDocument()
    })
})

import {fireEvent, render, screen} from '@testing-library/react'
import {act} from '@testing-library/react-hooks'
import React from 'react'

import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {AiAgentOverviewRootStateFixture} from 'pages/aiAgent/Overview/tests/AiAgentOverviewRootState.fixture'

import {PendingTasksSectionConnected} from '../PendingTasksSectionConnected'

const rootState = AiAgentOverviewRootStateFixture.start()
    .with2ShopifyIntegrations()
    .build()

describe('PendingTasksSection', () => {
    it('render the section in loading', () => {
        render(
            <Provider store={configureMockStore()(rootState)}>
                <PendingTasksSectionConnected />
            </Provider>
        )

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )
    })

    it('render the loading state', () => {
        jest.useFakeTimers()
        render(
            <Provider store={configureMockStore()(rootState)}>
                <PendingTasksSectionConnected />
            </Provider>
        )

        expect(screen.getAllByRole('link')[0]).toHaveAttribute(
            'aria-busy',
            'true'
        )

        act(() => {
            jest.runAllTimers()
        })

        expect(screen.getAllByRole('link')[0]).not.toHaveAttribute('aria-busy')
    })

    it('should expand when clicking on expand button', () => {
        jest.useFakeTimers()
        const rendered = render(
            <Provider store={configureMockStore()(rootState)}>
                <PendingTasksSectionConnected />
            </Provider>
        )

        act(() => {
            jest.runAllTimers()
        })

        expect(screen.getByRole('region').childNodes).toHaveLength(3)
        act(() => {
            fireEvent.click(rendered.container.querySelector('button')!)
        })

        expect(rendered.container.querySelector('button')!).toHaveAttribute(
            'aria-expanded',
            'true'
        )
        expect(screen.getByRole('region').childNodes).toHaveLength(7)
    })
})

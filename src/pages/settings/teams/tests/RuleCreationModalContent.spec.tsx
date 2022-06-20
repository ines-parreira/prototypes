import React from 'react'
import {fireEvent, render, screen, waitFor} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import {Provider} from 'react-redux'
import {fromJS} from 'immutable'

import {logEvent, SegmentEvent} from 'store/middlewares/segmentTracker'
import {integrationsState} from 'fixtures/integrations'
import {tags} from 'fixtures/tag'
import {createRule} from 'models/rule/resources'
import {TagsState} from 'state/entities/tags/types'
import {notify} from 'state/notifications/actions'
import {NotificationStatus} from 'state/notifications/types'
import {RootState, StoreDispatch} from 'state/types'

import RuleCreationModalContent from '../RuleCreationModalContent'

jest.mock('models/rule/resources', () => ({
    createRule: jest.fn(() => () => Promise.resolve({})),
}))

jest.mock('state/notifications/actions')

jest.mock('store/middlewares/segmentTracker')

const logEventMock = logEvent as jest.Mock

describe('<RuleCreationModalContent />', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const minProps = {
        onClose: jest.fn(),
        team: {
            id: 1,
            decoration: {},
            created_datetime: '1',
            members: [],
            name: 'foo',
            uri: 'bar',
        },
    }

    const store = mockStore({
        integrations: fromJS(integrationsState),
        entities: {
            tags: tags.reduce(
                (acc: TagsState, value) => ({
                    ...acc,
                    [value.id]: value,
                }),
                {}
            ),
        } as any,
    })

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render', () => {
        const {container} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        expect(container.firstChild).toMatchSnapshot()
    })

    it('should clear the value when the condition key change', () => {
        const {getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.focus(getByText(/Channel/))
        fireEvent.click(screen.getByText('Tag'))

        expect(getByText(/Select tags/)).toBeTruthy()
    })

    it('should disable submit when the form is not valid', () => {
        const {getByPlaceholderText, getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.change(getByPlaceholderText(/\[Auto assign\] foo/), {
            target: {value: ''},
        })
        fireEvent.focus(getByText(/Channel/))
        fireEvent.click(screen.getByText('Tag'))

        expect(
            (getByText(/^Create Rule$/) as HTMLButtonElement).disabled
        ).toBeTruthy()
    })

    it('should call onClose when clicking on "Create rule later"', () => {
        const {getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/Create rule later/))

        expect(minProps.onClose).toHaveBeenCalled()
    })

    it('should log a segment event and call onClose when successfully creating a new rule', async () => {
        const {getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/^Create Rule$/))

        expect(logEventMock).toHaveBeenCalledWith(
            SegmentEvent.TeamWizardCreatedRule
        )
        expect(createRule).toHaveBeenCalled()

        await waitFor(() => {
            expect(minProps.onClose).toHaveBeenCalled()
        })
    })

    it('should notify when failing to create a new rule', async () => {
        ;(
            createRule as jest.MockedFunction<typeof createRule>
        ).mockImplementationOnce(() => Promise.reject())
        const {getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.click(getByText(/^Create Rule$/))

        await waitFor(() => {
            expect(notify).toHaveBeenNthCalledWith(1, {
                message: 'Failed to create rule',
                status: NotificationStatus.Error,
            })
        })
    })

    it('should render a shorthand selection when selecting several items', () => {
        const {getByText} = render(
            <Provider store={store}>
                <RuleCreationModalContent {...minProps} />
            </Provider>
        )

        fireEvent.focus(getByText(/email/))
        fireEvent.click(screen.getByText('api'))
        fireEvent.click(screen.getByText('chat'))
        fireEvent.click(screen.getByText('facebook'))
        expect(getByText(/4 channels/)).toBeTruthy()
    })
})

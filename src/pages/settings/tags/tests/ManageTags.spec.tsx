import React from 'react'
import {Provider} from 'react-redux'
import {fromJS, Map} from 'immutable'
import {act, fireEvent, render} from '@testing-library/react'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {tags as tagsFixtures} from 'fixtures/tag'
import {fetchTags} from 'models/tag/resources'
import * as tagActions from 'state/tags/actions'
import {RootState, StoreDispatch} from 'state/types'

import ManageTags from '../ManageTags'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock('models/tag/resources')
const fetchTagsMock = fetchTags as jest.MockedFunction<typeof fetchTags>

jest.spyOn(tagActions, 'selectAll')
jest.spyOn(tagActions, 'bulkDelete')
jest.spyOn(tagActions, 'merge')

describe('ManageTags component', () => {
    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>([
        thunk,
    ])

    const meta = {
        1: {
            selected: true,
        },
        2: {
            selected: true,
        },
    }

    const keys = (fromJS(meta) as Map<any, any>).keySeq().toList()

    const defaultState: Partial<RootState> = {
        tags: fromJS({_internal: {}, meta, items: tagsFixtures}),
    }

    beforeEach(() => {
        jest.clearAllMocks()

        fetchTagsMock.mockResolvedValue({
            config: {},
            data: {
                uri: '/api/tags/',
                data: tagsFixtures,
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                },
                object: 'list',
            },
            headers: {},
            status: 200,
            statusText: '',
        })
    })

    it('should render a loader while fetching data', async () => {
        jest.useFakeTimers()

        const {container, findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ManageTags />
            </Provider>
        )

        act(() => {
            jest.runOnlyPendingTimers()
        })
        expect(container.firstChild).toMatchSnapshot()
        await findByText(tagsFixtures[0].name)
    })

    it('should render the list of tags', async () => {
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ManageTags />
            </Provider>
        )

        await findByText(tagsFixtures[0].name)
        await findByText(tagsFixtures[3].name)
    })

    it('should display create field when create button is toggled', async () => {
        const {findByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ManageTags />
            </Provider>
        )
        await findByText(tagsFixtures[0].name)
        const button = await findByText(/Create tag/i)
        fireEvent.click(button)

        await findByText(/Create a new tag/i)
    })

    it('delete all tags when select-all is checked', async () => {
        const {container, findByText, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ManageTags />
            </Provider>
        )

        await act(async () => {
            await findByText(tagsFixtures[0].name)

            fireEvent.click(
                container.querySelector(`input[name="select-all"]`)!
            )

            fireEvent.click(getByText('Delete'))
            const confirmButton = await findByText(/Confirm/i)
            fireEvent.click(confirmButton)

            expect(tagActions.bulkDelete).toHaveBeenCalledTimes(1)
            expect(tagActions.bulkDelete).toHaveBeenCalledWith(
                Object.keys(meta)
            )
        })
    })

    it('merge all tags when select-all is checked', async () => {
        const {container, findByText, getByText} = render(
            <Provider store={mockStore(defaultState)}>
                <ManageTags />
            </Provider>
        )

        await act(async () => {
            await findByText(tagsFixtures[0].name)

            fireEvent.click(
                container.querySelector(`input[name="select-all"]`)!
            )

            fireEvent.click(getByText('Merge'))
            const confirmButton = await findByText(/Confirm/i)
            fireEvent.click(confirmButton)

            expect(tagActions.merge).toHaveBeenCalledTimes(1)
            expect(tagActions.merge).toHaveBeenCalledWith(keys)
        })
    })

    it('should untoggle select-all checkbox after merge if the checkbox was toggled', async () => {
        const {container, findByText, getByText} = render(
            <Provider
                store={mockStore({
                    tags: fromJS({
                        _internal: {},
                        meta,
                        items: tagsFixtures,
                        selectAll: true,
                    }),
                })}
            >
                <ManageTags />
            </Provider>
        )

        await act(async () => {
            await findByText(tagsFixtures[0].name)

            fireEvent.click(
                container.querySelector(`input[name="select-all"]`)!
            )

            fireEvent.click(getByText('Merge'))
            const confirmButton = await findByText(/Confirm/i)
            fireEvent.click(confirmButton)

            expect(tagActions.selectAll).toHaveBeenCalledTimes(1)
        })
    })

    it('should untoggle select-all checkbox after deletion if the checkbox was toggled', async () => {
        const {container, findByText, getByText} = render(
            <Provider
                store={mockStore({
                    tags: fromJS({
                        _internal: {},
                        meta,
                        items: tagsFixtures,
                        selectAll: true,
                    }),
                })}
            >
                <ManageTags />
            </Provider>
        )

        await act(async () => {
            await findByText(tagsFixtures[0].name)

            fireEvent.click(
                container.querySelector(`input[name="select-all"]`)!
            )

            fireEvent.click(getByText('Delete'))
            const confirmButton = await findByText(/Confirm/i)
            fireEvent.click(confirmButton)

            expect(tagActions.selectAll).toHaveBeenCalledTimes(1)
        })
    })
})

import { render } from '@repo/testing'
import { act, fireEvent, screen } from '@testing-library/react'
import type { Map } from 'immutable'
import { fromJS } from 'immutable'

import { axiosSuccessResponse } from 'fixtures/axiosResponse'
import { tags as tagsFixtures } from 'fixtures/tag'
import { fetchTags } from 'models/tag/resources'
import * as tagActions from 'state/tags/actions'
import type { RootState } from 'state/types'

import { ManageTags } from '../ManageTags'

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => ({
    useAppDispatch: () => mockedDispatch,
}))
jest.mock('models/tag/resources')
const fetchTagsMock = fetchTags as jest.MockedFunction<typeof fetchTags>
jest.spyOn(tagActions, 'selectAll')
jest.spyOn(tagActions, 'bulkDelete')
jest.spyOn(tagActions, 'merge')
describe('ManageTags component', () => {
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
        tags: fromJS({ _internal: {}, meta, items: tagsFixtures }),
    }
    beforeEach(() => {
        fetchTagsMock.mockResolvedValue(
            axiosSuccessResponse({
                uri: '/api/tags/',
                data: tagsFixtures,
                meta: {
                    next_cursor: null,
                    prev_cursor: null,
                    total_resources: null,
                },
                object: 'list',
            }),
        )
    })
    it('should render a loader while fetching data', async () => {
        jest.useFakeTimers()
        const { container } = render(<ManageTags />, {
            storeState: defaultState,
        })
        act(() => {
            jest.runOnlyPendingTimers()
        })
        expect(container.firstChild).toMatchSnapshot()
        await screen.findByText(tagsFixtures[0].name)
    })
    it('should render the list of tags', async () => {
        render(<ManageTags />, {
            storeState: defaultState,
        })
        await screen.findByText(tagsFixtures[0].name)
        await screen.findByText(tagsFixtures[3].name)
    })
    it('should display create field when create button is toggled', async () => {
        render(<ManageTags />, {
            storeState: defaultState,
        })
        await screen.findByText(tagsFixtures[0].name)
        const button = await screen.findByText(/Create tag/i)
        fireEvent.click(button)
        await screen.findByText(/Create a new tag/i)
    })
    it('delete all tags when select-all is checked', async () => {
        render(<ManageTags />, {
            storeState: defaultState,
        })
        await screen.findByText(tagsFixtures[0].name)
        fireEvent.click(screen.getByRole('checkbox', { name: 'select-all' }))
        fireEvent.click(screen.getByText('Delete'))
        const confirmButton = await screen.findByText(/Confirm/i)
        fireEvent.click(confirmButton)
        expect(tagActions.bulkDelete).toHaveBeenCalledTimes(1)
        expect(tagActions.bulkDelete).toHaveBeenCalledWith(Object.keys(meta))
    })
    it('merge all tags when select-all is checked', async () => {
        render(<ManageTags />, {
            storeState: defaultState,
        })
        await screen.findByText(tagsFixtures[0].name)
        fireEvent.click(screen.getByRole('checkbox', { name: 'select-all' }))
        fireEvent.click(screen.getByText('Merge'))
        const confirmButton = await screen.findByText(/Confirm/i)
        fireEvent.click(confirmButton)
        expect(tagActions.merge).toHaveBeenCalledTimes(1)
        expect(tagActions.merge).toHaveBeenCalledWith(keys)
    })
    it('should untoggle select-all checkbox after merge if the checkbox was toggled', async () => {
        render(<ManageTags />, {
            storeState: {
                tags: fromJS({
                    _internal: {},
                    meta,
                    items: tagsFixtures,
                    selectAll: true,
                }),
            },
        })
        await screen.findByText(tagsFixtures[0].name)
        fireEvent.click(screen.getByRole('checkbox', { name: 'select-all' }))
        fireEvent.click(screen.getByText('Merge'))
        const confirmButton = await screen.findByText(/Confirm/i)
        fireEvent.click(confirmButton)
        expect(tagActions.selectAll).toHaveBeenCalledTimes(1)
    })
    it('should untoggle select-all checkbox after deletion if the checkbox was toggled', async () => {
        render(<ManageTags />, {
            storeState: {
                tags: fromJS({
                    _internal: {},
                    meta,
                    items: tagsFixtures,
                    selectAll: true,
                }),
            },
        })
        await screen.findByText(tagsFixtures[0].name)
        fireEvent.click(screen.getByRole('checkbox', { name: 'select-all' }))
        fireEvent.click(screen.getByText('Delete'))
        const confirmButton = await screen.findByText(/Confirm/i)
        fireEvent.click(confirmButton)
        expect(tagActions.bulkDelete).toHaveBeenCalledTimes(1)
        expect(tagActions.selectAll).toHaveBeenCalledTimes(1)
    })
})

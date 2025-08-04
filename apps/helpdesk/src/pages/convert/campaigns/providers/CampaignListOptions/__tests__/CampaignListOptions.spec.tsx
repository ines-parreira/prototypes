import { useContext } from 'react'

import { userEvent } from '@repo/testing'
import { render, waitFor } from '@testing-library/react'

import { useSearch } from 'hooks/useSearch'

import { CampaignListOptions } from '../CampaignListOptions'
import { CampaignListOptionsContext } from '../context'
import * as utils from '../utils'

jest.mock('hooks/useSearch')
jest.mock('../utils')

const TestingComponent = () => {
    const { getParams, onChangeParams } = useContext(CampaignListOptionsContext)
    const { page, search, state } = getParams()

    return (
        <>
            <span data-testid="page">{page}</span>
            <span data-testid="search">{search}</span>
            <span data-testid="state">{state}</span>

            <button
                data-testid="update"
                onClick={() =>
                    onChangeParams({
                        page: 2,
                        search: 'test',
                        state: 'active',
                    })
                }
            >
                Update
            </button>
        </>
    )
}

describe('<CampaignListOptions />', () => {
    const updateUrlSpy = jest.spyOn(utils, 'updateUrlWithSearchParams')

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: {
                search: '',
            },
        })
        ;(useSearch as jest.Mock).mockImplementation(() => ({}))
    })

    afterEach(() => {
        updateUrlSpy.mockClear()
    })

    it('provides the default context', () => {
        const { getByTestId } = render(
            <CampaignListOptions>
                <TestingComponent />
            </CampaignListOptions>,
        )

        expect(getByTestId('page')).toHaveTextContent('1')
        expect(getByTestId('search')).toHaveTextContent('')
        expect(getByTestId('state')).toHaveTextContent('all')
    })

    it('syncs the URL with the current options', () => {
        expect(window.location.search).toBe('')

        render(
            <CampaignListOptions>
                <TestingComponent />
            </CampaignListOptions>,
        )

        expect(updateUrlSpy).toHaveBeenCalledWith({
            page: 1,
            search: '',
            state: 'all',
            filters: '',
        })
    })

    it('updates the URL when the options change', async () => {
        const { getByTestId } = render(
            <CampaignListOptions>
                <TestingComponent />
            </CampaignListOptions>,
        )

        await userEvent.click(getByTestId('update'))

        await waitFor(() => {
            expect(getByTestId('page')).toHaveTextContent('2')
            expect(getByTestId('search')).toHaveTextContent('test')
            expect(getByTestId('state')).toHaveTextContent('active')

            expect(updateUrlSpy).toHaveBeenCalledWith({
                page: 2,
                search: 'test',
                state: 'active',
                filters: '',
            })
        })
    })
})

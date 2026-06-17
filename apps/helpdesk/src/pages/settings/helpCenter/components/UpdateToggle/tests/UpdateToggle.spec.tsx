import React from 'react'

import { render } from '@repo/testing'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { toast } from '@gorgias/axiom'

import type { Components } from 'rest_api/help_center_api/client.generated'
import type { RootState, StoreDispatch } from 'state/types'

import { UpdateToggle } from '../UpdateToggle'

const mockedUpdateHelpCenter = jest.fn()

jest.mock('@repo/logging', () => ({
    ...jest.requireActual('@repo/logging'),
    reportError: jest.fn(),
}))

jest.mock('../../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter.mockResolvedValue({
                    data: {},
                }),
            },
        }),
    }
})

jest.mock('../../../hooks/useHelpCenterIdParam', () => {
    return {
        useHelpCenterIdParam: () => 1,
    }
})

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

describe('<UpdateToggle />', () => {
    const props = {
        activated: true,
        label: 'label',
        description: 'description',
        fieldName:
            'search_deactivated' as keyof Components.Schemas.UpdateHelpCenterDto,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    afterEach(() => {
        toast.dismiss()
    })

    it('should display the update toggle', () => {
        const { container } = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>,
        )

        expect(container).toMatchSnapshot()
    })

    it('should trigger the update callback when clicking on the checkbox', async () => {
        const { findByRole } = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>,
        )
        const toggle = await findByRole('checkbox')
        fireEvent.click(toggle)
        expect(mockedUpdateHelpCenter).toHaveBeenLastCalledWith(
            { help_center_id: 1 },
            { search_deactivated: true },
        )
    })

    it('should show a success toast when the update succeeds', async () => {
        const { findByRole } = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>,
        )
        const toggle = await findByRole('checkbox')
        fireEvent.click(toggle)

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Help Center updated with success',
                }),
            ).toHaveAttribute('data-intent', 'success'),
        )
    })

    it('should show an error toast when the update fails', async () => {
        const { findByRole } = render(
            <Provider store={mockedStore({})}>
                <UpdateToggle {...props} />
            </Provider>,
        )
        const toggle = await findByRole('checkbox')
        mockedUpdateHelpCenter.mockRejectedValueOnce(new Error('update failed'))
        fireEvent.click(toggle)

        await waitFor(() =>
            expect(
                screen.getByRole('status', {
                    name: 'Failed to update the Help Center',
                }),
            ).toHaveAttribute('data-intent', 'destructive'),
        )
    })
})

import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {RootState, StoreDispatch} from '../../../../../state/types'
import {renderWithRouter} from '../../../../../utils/testing'
import {getSingleHelpCenterResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import {useCurrentHelpCenter} from '../../providers/CurrentHelpCenter'

import HelpCenterAppearanceView from '../HelpCenterAppearanceView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getSingleHelpCenterResponseFixture,
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

const mockedUpdateHelpCenter = jest.fn().mockResolvedValue({
    data: getSingleHelpCenterResponseFixture,
})

jest.mock('../../hooks/useHelpCenterApi', () => {
    return {
        useHelpCenterApi: () => ({
            isReady: true,
            client: {
                updateHelpCenter: mockedUpdateHelpCenter,
            },
        }),
    }
})

jest.mock('../../providers/CurrentHelpCenter')
const mockedUseCurrentHelpCenter = (
    useCurrentHelpCenter as jest.Mock
).mockReturnValue(getSingleHelpCenterResponseFixture)

const route = {
    path: '/app/settings/help-center/:helpCenterId/appearance',
    route: '/app/settings/help-center/1/appearance',
}

describe('<HelpCenterAppearanceView />', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should render the component', () => {
        const {container} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterAppearanceView />
            </Provider>,
            route
        )

        expect(container).toMatchSnapshot()
    })

    it('disables "Save Changes" button if there are no changes', () => {
        const {getByRole, getByLabelText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterAppearanceView />
            </Provider>,
            route
        )

        const saveBtn = getByRole('button', {
            name: 'Save Changes',
        }) as HTMLButtonElement

        // Initial state is disabled
        expect(saveBtn.disabled).toBeTruthy()

        // Change one setting and expect the button to become active
        fireEvent.click(getByLabelText('Dark Theme'))
        expect(saveBtn.disabled).toBeFalsy()

        // Change back the setting and expect the initial state
        fireEvent.click(getByLabelText('Light Theme'))
        expect(saveBtn.disabled).toBeTruthy()
    })

    it('restores the default state when "Cancel" is clicked', () => {
        const {getByRole, getByLabelText} = renderWithRouter(
            <Provider store={mockedStore(defaultState)}>
                <HelpCenterAppearanceView />
            </Provider>,
            route
        )

        const cancelBtn = getByRole('button', {
            name: 'Cancel',
        }) as HTMLButtonElement
        const saveBtn = getByRole('button', {
            name: 'Save Changes',
        }) as HTMLButtonElement

        fireEvent.click(getByLabelText('Dark Theme'))
        expect(saveBtn.disabled).toBeFalsy()

        fireEvent.click(cancelBtn)
        expect(saveBtn.disabled).toBeTruthy()
    })

    it.each([
        'brand_logo_url',
        'favicon_url',
        'brand_logo_light_url',
        'banner_image_url',
    ])(
        'should update the Help center with the "%s" field set to null after dismissing it',
        async (imageField) => {
            mockedUseCurrentHelpCenter.mockReturnValueOnce({
                ...getSingleHelpCenterResponseFixture,
                [imageField]: 'https://picsum.photos/200',
            })

            const stateWithImage: Partial<RootState> = {
                ...defaultState,
                entities: {
                    helpCenters: {
                        '1': {
                            ...getSingleHelpCenterResponseFixture,
                            [imageField]: 'https://picsum.photos/200',
                        },
                    },
                } as any,
            }

            const {getByText, getByRole} = renderWithRouter(
                <Provider store={mockedStore(stateWithImage)}>
                    <HelpCenterAppearanceView />
                </Provider>,
                route
            )

            // dismissing the only image set to a URL value
            fireEvent.click(getByText('close'))

            fireEvent.click(
                getByRole('button', {
                    name: 'Save Changes',
                })
            )

            await waitFor(() => {
                expect(mockedUpdateHelpCenter).toHaveBeenCalledTimes(1)
                expect(mockedUpdateHelpCenter).toHaveBeenCalledWith(
                    {
                        help_center_id: 1,
                    },
                    expect.objectContaining({
                        [imageField]: null,
                    })
                )
            })
        }
    )
})

import React from 'react'
import {fireEvent, waitFor} from '@testing-library/react'
import {Provider} from 'react-redux'
import thunk from 'redux-thunk'
import configureMockStore from 'redux-mock-store'

import {RootState, StoreDispatch} from '../../../../../state/types'
import {initialState as articlesState} from '../../../../../state/helpCenter/articles/reducer'
import {initialState as uiState} from '../../../../../state/helpCenter/ui/reducer'
import {initialState as categoriesState} from '../../../../../state/helpCenter/categories/reducer'
import {renderWithRouter} from '../../../../../utils/testing'
import {getHelpCentersResponseFixture} from '../../fixtures/getHelpCentersResponse.fixture'
import HelpCenterAppearanceView from '../HelpCenterAppearanceView'

const mockedStore = configureMockStore<Partial<RootState>, StoreDispatch>([
    thunk,
])

const defaultState: Partial<RootState> = {
    entities: {
        helpCenters: {
            '1': getHelpCentersResponseFixture.data[0],
        },
    } as any,
    helpCenter: {
        ui: {...uiState, currentId: 1},
        articles: articlesState,
        categories: categoriesState,
    },
}

const mockedUpdateHelpCenter = jest.fn().mockResolvedValue({
    data: getHelpCentersResponseFixture.data[0],
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

const route = {
    path: '/app/settings/help-center/:helpCenterId/appearance',
    route: '/app/settings/help-center/1/appearance',
}

describe('<HelpCenterAppearanceView/>', () => {
    beforeEach(() => {
        jest.resetAllMocks()
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
            mockedUpdateHelpCenter.mockResolvedValueOnce({
                data: {},
            })

            const stateWithImage: Partial<RootState> = {
                entities: {
                    helpCenters: {
                        '1': {
                            ...getHelpCentersResponseFixture.data[0],
                            [imageField]: 'https://picsum.photos/200',
                        },
                    },
                } as any,
                helpCenter: defaultState.helpCenter,
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

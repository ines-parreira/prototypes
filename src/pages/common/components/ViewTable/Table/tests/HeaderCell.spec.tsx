import {fireEvent, render} from '@testing-library/react'
import {Map, List} from 'immutable'
import LD from 'launchdarkly-react-client-sdk'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'

import {FeatureFlagKey} from 'config/featureFlags'
import {views} from 'config/views'
import {OrderDirection} from 'models/api/types'
import {EntityType, ViewField} from 'models/view/types'
import {RootState, StoreDispatch} from 'state/types'
import {fetchViewItems, setOrderDirection} from 'state/views/actions'
import {assumeMock} from 'utils/testing'

import HeaderCell from '../HeaderCell'

jest.mock('state/views/actions')
const fetchViewItemsMock = assumeMock(fetchViewItems)
const setOrderDirectionMock = assumeMock(setOrderDirection)

const mockedDispatch = jest.fn()
jest.mock('hooks/useAppDispatch', () => () => mockedDispatch)

jest.mock(
    'pages/common/components/ViewTable/ShowMoreFieldsDropdown',
    () => () => <div>ShowMoreFieldsDropdown</div>
)

describe('ViewTable::Table::HeaderCell', () => {
    const viewConfig = views.first() as Map<any, any>

    class ActionsComponent extends React.Component {
        render() {
            return <div>ACTIONS</div>
        }
    }

    const viewConfigFields = viewConfig.get('fields') as List<any>

    const minProps = {
        ActionsComponent,
        field: viewConfigFields.first(),
        fields: viewConfigFields.take(3) as List<any>,
        shouldRenderShowMoreDropdown: false,
        isSearch: false,
        type: viewConfig.get('name'),
    }

    const createdViewField = viewConfigFields.find(
        (field: Map<any, any>) => field.get('name') === ViewField.Created
    ) as Map<any, any>

    beforeEach(() => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AdvancedSearchSorting]: false,
        }))
    })

    const mockStore = configureMockStore<Partial<RootState>, StoreDispatch>()

    it('displays the default cell', () => {
        const {container} = render(
            <Provider store={mockStore({})}>
                <HeaderCell {...minProps} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it('does not display ActionsComponent for non-main field cell', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={viewConfigFields.get(1)} />
            </Provider>
        )
        expect(container.firstChild).toMatchSnapshot()
    })

    it.each([
        ['when not in search mode', false, false],
        [
            'when in search mode and AdvancedSearchSorting feature flag is enabled',
            true,
            true,
        ],
    ])(
        'displays sortable field cell when %s',
        (_, isSearch, isAdvancedSearchSortingEnabled) => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AdvancedSearchSorting]:
                    isAdvancedSearchSortingEnabled,
            }))

            const {container} = render(
                <Provider store={mockStore()}>
                    <HeaderCell
                        {...minProps}
                        field={createdViewField}
                        isSearch={isSearch}
                    />
                </Provider>
            )

            expect(container.getElementsByClassName('clickable')).toHaveLength(
                1
            )
        }
    )

    it('should not display sortable field cell when in search mode', () => {
        const {container} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={createdViewField} isSearch />
            </Provider>
        )

        expect(container.getElementsByClassName('clickable')).toHaveLength(0)
    })

    it.each([
        ['when not in search mode', false, false],
        [
            'when in search mode and AdvancedSearchSorting feature flag is enabled',
            true,
            true,
        ],
    ])(
        'sorts by the field value on click %s',
        (_, isSearch, isAdvancedSearchSortingEnabled) => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AdvancedSearchSorting]:
                    isAdvancedSearchSortingEnabled,
            }))

            const {getByText} = render(
                <Provider store={mockStore()}>
                    <HeaderCell
                        {...minProps}
                        field={createdViewField}
                        isSearch={isSearch}
                    />
                </Provider>
            )

            fireEvent.click(getByText(createdViewField.get('title')))

            expect(fetchViewItemsMock).toHaveBeenCalledWith(
                undefined,
                undefined,
                undefined,
                undefined,
                {
                    orderBy: `${createdViewField.get('path') as string}:${
                        OrderDirection.Desc
                    }`,
                }
            )
            expect(setOrderDirectionMock).toHaveBeenCalledWith(
                createdViewField.get('path'),
                OrderDirection.Desc
            )
        }
    )

    it('should not sort by field value on click when in search mode', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <HeaderCell {...minProps} field={createdViewField} isSearch />
            </Provider>
        )

        fireEvent.click(getByText(createdViewField.get('title')))

        expect(fetchViewItemsMock).not.toHaveBeenCalled()
        expect(setOrderDirectionMock).not.toHaveBeenCalled()
    })

    it('should not enable sort by field value on click when not in search mode and isClickable is false', () => {
        const {getByText} = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    field={createdViewField}
                    isClickable={false}
                />
            </Provider>
        )

        const field = getByText(createdViewField.get('title'))
        fireEvent.click(field)

        expect(field.parentNode).not.toHaveClass('clickable')
        expect(fetchViewItemsMock).not.toHaveBeenCalled()
        expect(setOrderDirectionMock).not.toHaveBeenCalled()
    })

    it.each([
        ['when not in search mode', false, false],
        [
            'when in search mode and AdvancedSearchSorting feature flag is enabled',
            true,
            true,
        ],
    ])(
        'should show the ShowMoreFieldsDropdown %s',
        (_, isSearch, isAdvancedSearchSortingEnabled) => {
            jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
                [FeatureFlagKey.AdvancedSearchSorting]:
                    isAdvancedSearchSortingEnabled,
            }))

            const {getByText} = render(
                <Provider store={mockStore()}>
                    <HeaderCell
                        {...minProps}
                        shouldRenderShowMoreDropdown
                        isSearch={isSearch}
                    />
                </Provider>
            )

            expect(getByText('ShowMoreFieldsDropdown')).toBeInTheDocument()
        }
    )

    it('should hide the ShowMoreFieldsDropdown when in search mode', () => {
        const {queryByText} = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    shouldRenderShowMoreDropdown
                    isSearch
                />
            </Provider>
        )

        expect(queryByText('ShowMoreFieldsDropdown')).not.toBeInTheDocument()
    })

    it('should hide the ShowMoreFieldsDropdown when not on ticket search view', () => {
        jest.spyOn(LD, 'useFlags').mockImplementation(() => ({
            [FeatureFlagKey.AdvancedSearchSorting]: true,
        }))

        const {queryByText} = render(
            <Provider store={mockStore()}>
                <HeaderCell
                    {...minProps}
                    shouldRenderShowMoreDropdown
                    isSearch
                    type={EntityType.Customer}
                />
            </Provider>
        )

        expect(queryByText('ShowMoreFieldsDropdown')).not.toBeInTheDocument()
    })
})

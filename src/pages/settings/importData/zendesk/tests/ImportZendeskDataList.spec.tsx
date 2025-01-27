import {fireEvent, render, RenderResult} from '@testing-library/react'
import {fromJS} from 'immutable'
import React from 'react'
import {Provider} from 'react-redux'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'

import {UserSettingType} from 'config/types/user'
import {
    DateFormatType,
    TimeFormatType,
    DateTimeFormatType,
    DateTimeFormatMapper,
    DateTimeResultFormatType,
} from 'constants/datetime'

import {ZendeskIntegration} from '../../../../../models/integration/types'
import history from '../../../../history'
import {ImportZendeskDataList} from '../ImportZendeskDataList'

import {
    failedImport,
    pendingImport,
    rateLimitedImport,
    successImport,
} from './fixtures'

interface DefaultProps {
    img: string
    zendeskImports: ZendeskIntegration[]
    timezone: string | null
    datetimeFormat: DateTimeResultFormatType
}

const mockStore = configureMockStore([thunk])

const store = mockStore({
    currentUser: fromJS({
        id: 1,
        email: 'steve@acme.gorgias.io',
        settings: [
            {
                data: {
                    date_format: DateFormatType.en_GB,
                    time_format: TimeFormatType.AmPm,
                },
                id: 21,
                type: UserSettingType.Preferences,
            },
        ],
    }),
})

const renderComponent = (props: DefaultProps): RenderResult => {
    return render(
        <Provider store={store}>
            <ImportZendeskDataList {...props} />
        </Provider>
    )
}

describe('<ImportZendeskDataList/>', () => {
    const defaultProps = {
        img: `/zendesk.png`,
        timezone: 'UTC',
        datetimeFormat:
            DateTimeFormatMapper[
                DateTimeFormatType.COMPACT_DATE_WITH_TIME_EN_US_AM_PM
            ],
    }
    describe('rendering', () => {
        it('should render the list of imports', () => {
            const {getAllByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: [successImport, pendingImport, failedImport],
            })
            expect(getAllByRole('row').length).toEqual(3)
        })

        it('should render a paused import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: [successImport],
            })
            expect(getByText('Paused')).toBeDefined()
            expect(getByText(successImport.name)).toBeDefined()
        })
        it('should render a synchronizing import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: [
                    {
                        ...successImport,
                        meta: {
                            ...successImport.meta,
                            continuous_import_enabled: true,
                        },
                    },
                ],
            })
            expect(getByText('Synchronizing')).toBeDefined()
            expect(getByText(successImport.name)).toBeDefined()
        })

        it('should render a pending import', () => {
            const {getByText, getByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: [pendingImport],
            })
            expect(getByText('Progress 10%')).toBeDefined()
            expect(getByText(pendingImport.name)).toBeDefined()
            expect(getByRole('progressbar').getAttribute('style')).toEqual(
                'width: 10%;'
            )
        })

        it('should render a pending import for rate limit back off', () => {
            const {getByText, getByRole} = renderComponent({
                ...defaultProps,
                zendeskImports: [rateLimitedImport],
            })
            expect(getByText('Progress 10%')).toBeDefined()
            expect(getByText(pendingImport.name)).toBeDefined()
            expect(getByRole('progressbar').getAttribute('style')).toEqual(
                'width: 10%;'
            )
        })

        it('should render a failed import', () => {
            const {getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: [failedImport],
            })
            expect(getByText(failedImport.meta.error!)).toBeDefined()
            expect(getByText(failedImport.name)).toBeDefined()
        })

        it('should redirect to detailed page after user clicked on particular import row', () => {
            const mockedPush = jest.fn()
            jest.mock('react-router-dom', () => ({
                useHistory: () => ({
                    push: mockedPush,
                }),
            }))
            const {getByRole, getByText} = renderComponent({
                ...defaultProps,
                zendeskImports: [successImport],
            })
            const row = getByRole('row')
            fireEvent.click(row)
            expect(history.push).toBeCalledWith(
                `/app/settings/import-data/zendesk/${successImport.id}`
            )
            expect(getByText('Completed on 11/27/2020 06:19 PM')).toBeDefined()
        })
    })
})

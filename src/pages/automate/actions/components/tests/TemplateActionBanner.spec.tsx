import React from 'react'
import {render, screen} from '@testing-library/react'
import {dummyAppListData} from 'fixtures/apps'
import {useGetApps, useGetAppsByIds} from 'models/integration/queries'
import {useListActionsApps} from 'models/workflows/queries'
import TemplateActionBanner from '../TemplateActionBanner'

jest.mock('models/integration/queries')
jest.mock('models/workflows/queries')

const mockUseGetApps = jest.mocked(useGetApps)
const mockUseGetAppsByIds = jest.mocked(useGetAppsByIds)
const mockUseListActionsApps = jest.mocked(useListActionsApps)

describe('<TemplateActionBanner />', () => {
    it('should render component', () => {
        mockUseGetApps.mockReturnValue({
            data: [dummyAppListData],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useGetApps>)

        mockUseListActionsApps.mockReturnValue({
            data: [],
            isInitialLoading: false,
        } as unknown as ReturnType<typeof useListActionsApps>)

        mockUseGetAppsByIds.mockReturnValue([])

        render(
            <TemplateActionBanner
                name="test template"
                actionAppConfiguration={{
                    app_id: '1',
                    type: 'app',
                }}
            />
        )

        expect(screen.getByText('test template')).toBeInTheDocument()
    })
})

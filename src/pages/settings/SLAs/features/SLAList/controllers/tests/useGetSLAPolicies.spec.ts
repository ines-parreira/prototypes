import {
    HttpResponse,
    ListSlaPolicies200,
    useListSlaPolicies,
} from '@gorgias/api-queries'

import { slaPolicy1, UISLAPolicy1 } from 'pages/settings/SLAs/fixtures/fixtures'
import { renderHook } from 'utils/testing/renderHook'

import makeUISLAPolicy from '../makeUISLAPolicy'
import useGetSLAPolicies from '../useGetSLAPolicies'

jest.mock('@gorgias/api-queries')
const mockUseListSlaPolicies = useListSlaPolicies as jest.Mock
jest.mock('../makeUISLAPolicy')
const mockMakeUISLAPolicy = makeUISLAPolicy as jest.Mock

const generateMockUseListSlaPolicies = () => {
    return (...fnParams: Parameters<typeof useListSlaPolicies>) => {
        const [, options] = fnParams
        const select = options?.query?.select
        return {
            data: select?.({
                data: {
                    data: [{}],
                },
            } as HttpResponse<ListSlaPolicies200>),
        }
    }
}

describe('useGetSLAPolicies', () => {
    beforeEach(() => {
        mockUseListSlaPolicies.mockImplementation(
            generateMockUseListSlaPolicies(),
        )
    })
    it('should transform api query data', () => {
        mockMakeUISLAPolicy.mockImplementation(() => UISLAPolicy1)

        const { result } = renderHook(() => useGetSLAPolicies())

        expect(result.current.data).toEqual([UISLAPolicy1])
    })

    it('should use created_datetime if updated_datetime is not available', () => {
        const UISLAPolicy1WithoutUpdatedDatetime = {
            ...UISLAPolicy1,
            updatedDatetime: slaPolicy1.created_datetime,
        }
        mockMakeUISLAPolicy.mockImplementation(() => UISLAPolicy1)

        const { result } = renderHook(() => useGetSLAPolicies())

        expect(result.current.data).toEqual([
            UISLAPolicy1WithoutUpdatedDatetime,
        ])
    })
})

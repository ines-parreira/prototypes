import * as api from '@gorgias/api-queries'
import {render, screen} from '@testing-library/react'
import React from 'react'

import {WithSlaEmptyState} from 'pages/stats/sla/components/WithSlaEmptyState'
import {CONTENT_HEADER_TEXT} from 'pages/stats/sla/ServiceLevelAgreementsEmptyState'

jest.mock('@gorgias/api-queries')

describe('WithSlaEmptyState', () => {
    it('should render loading skeleton when policies loading', () => {
        jest.spyOn(api, 'useListSlaPolicies').mockReturnValue({
            isLoading: true,
            data: undefined,
        } as any)

        render(<WithSlaEmptyState>something</WithSlaEmptyState>)

        expect(
            document.querySelector('.react-loading-skeleton')
        ).toBeInTheDocument()
    })

    it('should render Empty state when no policies', () => {
        jest.spyOn(api, 'useListSlaPolicies').mockReturnValue({
            isLoading: false,
            data: {data: {data: []}},
        } as any)

        render(<WithSlaEmptyState>something</WithSlaEmptyState>)

        expect(screen.getByText(CONTENT_HEADER_TEXT)).toBeInTheDocument()
    })

    it('should render children', () => {
        jest.spyOn(api, 'useListSlaPolicies').mockReturnValue({
            isLoading: false,
            data: {data: {data: [{}]}},
        } as any)
        const child = 'something'

        render(<WithSlaEmptyState>{child}</WithSlaEmptyState>)

        expect(screen.getByText(child)).toBeInTheDocument()
    })
})

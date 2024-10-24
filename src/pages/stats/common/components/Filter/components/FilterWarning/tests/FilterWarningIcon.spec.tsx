import {act, render, screen, waitFor} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

import {FilterWarningIcon} from 'pages/stats/common/components/Filter/components/FilterWarning/FilterWarningIcon'
import {FILTER_WARNING_ICON} from 'pages/stats/common/components/Filter/constants'

describe('FilterWarningIcon', () => {
    it.each(['not-applicable' as const, 'non-existent' as const])(
        'render icon with a tooltip',
        async (warningType) => {
            const tooltipText = 'Some warning'

            render(
                <FilterWarningIcon
                    warningType={warningType}
                    tooltip={tooltipText}
                />
            )
            const icon = screen.getByText(FILTER_WARNING_ICON)
            act(() => {
                userEvent.hover(icon)
            })

            expect(icon).toBeInTheDocument()

            await waitFor(() => {
                expect(screen.getByText(tooltipText)).toBeInTheDocument()
            })
        }
    )
})

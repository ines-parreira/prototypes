import { renderHook } from '@testing-library/react-hooks'

import { Button } from 'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/types'

import { useComputeNbButtonDisplayed } from '../useComputeNbButtonDisplayed'

jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/hooks/useTemplateContext',
    () => ({
        useTemplateContext: jest.fn(() => ({})),
    }),
)
jest.mock(
    'pages/common/components/infobar/Infobar/InfobarCustomerInfo/InfobarWidgets/widgets/customActions/ActionButtons/helpers/computeNbButtonDisplayed',
    () => ({
        computeNbButtonDisplayed: jest.fn(() => 2),
    }),
)

describe('useComputeNbButtonDisplayed', () => {
    it('should return a number of buttons displayed', () => {
        const buttons = [
            { label: '{{label_0}}', action: {} },
            { label: 'ok {{ticket.someData}} {{user.name}}', action: {} },
            { label: '{{label_1}}', action: {} },
            { label: 'who cares', action: {} },
        ] as Button[]

        const containerRef = { current: document.createElement('div') }

        const { result } = renderHook(() =>
            useComputeNbButtonDisplayed(buttons, containerRef, {}),
        )
        expect(result.current).toBe(2)
    })
})

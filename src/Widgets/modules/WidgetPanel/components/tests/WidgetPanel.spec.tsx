import React, {ComponentProps} from 'react'
import {render} from '@testing-library/react'

import {WidgetType} from 'state/widgets/types'

import ColorPanel from '../views/ColorPanel'

import WidgetPanel, {WIDGET_COLORS} from '../WidgetPanel'

const MOCK_ACCENT_COLOR_ID = 'accent-color'
jest.mock('Widgets/modules/WidgetPanel/components/views/ColorPanel.tsx', () =>
    jest.fn(({accentColor}: ComponentProps<typeof ColorPanel>) => (
        <span data-testid={MOCK_ACCENT_COLOR_ID}>{accentColor}</span>
    ))
)

describe('WidgetPanel', () => {
    it.each(
        Object.entries(WIDGET_COLORS).map(([widgetType, color]) => ({
            widgetType: widgetType as WidgetType,
            color,
        }))
    )(
        'should display "$color" accent color for "$widgetType" widget',
        ({widgetType, color}) => {
            const {getByTestId} = render(
                <WidgetPanel widgetType={widgetType} />
            )

            expect(getByTestId(MOCK_ACCENT_COLOR_ID)).toHaveTextContent(color)
        }
    )

    it('should display custom color before accent color', () => {
        const customColor = 'red'
        const {getByTestId} = render(
            <WidgetPanel widgetType="standalone" customColor={customColor} />
        )

        expect(getByTestId(MOCK_ACCENT_COLOR_ID)).toHaveTextContent(customColor)
    })

    it('should display a fallback color if there is no color defined for the passed widget type', () => {
        const fallbackColor = 'yellow'
        const {getByTestId} = render(
            <WidgetPanel widgetType="custom" fallbackColor={fallbackColor} />
        )

        expect(getByTestId(MOCK_ACCENT_COLOR_ID)).toHaveTextContent(
            fallbackColor
        )
    })
})

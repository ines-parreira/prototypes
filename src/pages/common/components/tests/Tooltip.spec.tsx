import React from 'react'
import {render} from '@testing-library/react'

import * as uiKit from '@gorgias/ui-kit'

import Tooltip from 'pages/common/components/Tooltip'

jest.mock('@gorgias/ui-kit')

const mockComponent = () => <div></div>

describe('<Tooltip />', () => {
    it('should use appNode', () => {
        const target = '.abc'
        const child = 'Somethinf'
        const tooltipSpy = jest
            .spyOn(uiKit, 'Tooltip')
            .mockReturnValue(mockComponent())

        render(<Tooltip target={target}>{child}</Tooltip>)

        expect(tooltipSpy).toHaveBeenCalledWith(
            {appNode: null, target, children: child},
            {}
        )
    })
})

import React from 'react'
import {render} from '@testing-library/react'
import {RootNodeProvider} from '@gorgias/ui-kit'

import {useAppNode} from 'appNode'
import {assumeMock} from 'utils/testing'

import UIKitRootNodeProvider from '../UIKitRootNodeProvider'

jest.mock('appNode')
const useAppNodeMock = assumeMock(useAppNode)

jest.mock('@gorgias/ui-kit', () => {
    return {
        ...jest.requireActual('@gorgias/ui-kit'),
        RootNodeProvider: jest.fn(() => null),
    } as Record<string, unknown>
})
const RootNodeProviderMock = assumeMock(RootNodeProvider)

describe('UIKitNodeProvider', () => {
    it('should render RootNodeProvider with the appNode', () => {
        const appNode = document.createElement('div')
        useAppNodeMock.mockReturnValue(appNode)

        render(<UIKitRootNodeProvider />)

        expect(RootNodeProviderMock).toHaveBeenCalledWith(
            expect.objectContaining({value: appNode}),
            expect.anything()
        )
    })
})

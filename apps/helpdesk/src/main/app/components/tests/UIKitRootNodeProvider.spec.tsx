import React from 'react'

import { assumeMock } from '@repo/testing'
import { render } from '@testing-library/react'

import { RootNodeProvider } from '@gorgias/axiom'

import { useAppNode } from 'appNode'

import UIKitRootNodeProvider from '../UIKitRootNodeProvider'

jest.mock('appNode')
const useAppNodeMock = assumeMock(useAppNode)

jest.mock('@gorgias/axiom', () => {
    return {
        ...jest.requireActual('@gorgias/axiom'),
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
            expect.objectContaining({ value: appNode }),
            expect.anything(),
        )
    })
})

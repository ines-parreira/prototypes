import {render, screen} from '@testing-library/react'
import React from 'react'

import {assumeMock} from 'utils/testing'

import usePanel from '../../hooks/usePanel'
import Panel from '../Panel'

jest.mock('../../hooks/usePanel', () => jest.fn())
const usePanelMock = assumeMock(usePanel)

jest.mock('../Handle', () => () => <div>Handle</div>)

describe('Panel', () => {
    const config = {
        defaultSize: 200,
        minSize: 100,
        maxSize: 300,
    }

    beforeEach(() => {
        usePanelMock.mockReturnValue({size: 200})
    })

    it('should render the panel', () => {
        render(
            <Panel name="panel1" config={config}>
                boop
            </Panel>
        )
        const el = screen.getByText('boop')
        expect(el).toBeInTheDocument()
        expect(el).toHaveAttribute('data-panel-name', 'panel1')
        expect(el).toHaveStyle({width: '200px'})
    })

    it('should render a handle if there is a resizer', () => {
        usePanelMock.mockReturnValue({resizer: jest.fn(), size: 200})
        render(
            <Panel name="panel1" config={config}>
                boop
            </Panel>
        )
        expect(screen.getByText('Handle')).toBeInTheDocument()
    })
})

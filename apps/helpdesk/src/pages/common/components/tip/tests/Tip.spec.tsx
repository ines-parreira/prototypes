import { render } from '@repo/testing'
import { fireEvent, screen } from '@testing-library/react'
import { Map } from 'immutable'

import type { RootState } from 'state/types'

import Tip from '../Tip'

const defaultState = {
    currentUser: Map({
        id: 1,
    }),
} as RootState

const renderTip = () =>
    render(
        <Tip icon={true} actionLabel="Got It" storageKey="test">
            test
        </Tip>,
        { storeState: defaultState },
    )

describe('<Tip/>', () => {
    it('should not render another instance after closing', () => {
        const { container } = renderTip()

        fireEvent.click(screen.getByText('Got It'))

        expect(container.firstChild).toBeNull()

        const { container: secondContainer } = renderTip()

        expect(secondContainer.firstChild).toBeNull()
    })
})

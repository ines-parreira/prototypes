import React from 'react'
import {render, screen} from '@testing-library/react'

import {StatusCheck} from '../StatusCheck'

describe('<StatusCheck />', () => {
    it('matches snapshot', () => {
        const {container} = render(
            <StatusCheck onCheckStatus={() => null} status="pending" />
        )
        expect(container).toMatchSnapshot()
    })

    it("doesn't render if there's no status", () => {
        render(<StatusCheck onCheckStatus={() => null} />)

        expect(screen.queryByTestId('domain-status-check')).toBeNull()
    })
})

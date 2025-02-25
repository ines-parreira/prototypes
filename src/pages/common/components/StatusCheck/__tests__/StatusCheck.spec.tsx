import React from 'react'

import { render, screen } from '@testing-library/react'

import { StatusCheck } from '../StatusCheck'

describe('<StatusCheck />', () => {
    it('matches snapshot', () => {
        render(<StatusCheck onCheckStatus={() => null} status="pending" />)

        screen.getByText('Check Status')
        screen.getByText(
            'NOTE: It may take up to a few hours for DNS changes to take effect.',
        )
    })

    it("doesn't render if there's no status", () => {
        const { container } = render(<StatusCheck onCheckStatus={() => null} />)

        expect(container.firstChild).toBeNull()
    })
})

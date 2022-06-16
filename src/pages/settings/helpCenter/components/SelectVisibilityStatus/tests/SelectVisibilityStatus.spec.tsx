import React from 'react'
import {fireEvent, render} from '@testing-library/react'

import SelectVisibilityStatus from '../SelectVisibilityStatus'

const onChange = jest.fn()
const setShowNotification = jest.fn()

describe('<SelectVisibilityStatus />', () => {
    it('should show selected option', () => {
        const {container, getByText, getAllByText} = render(
            <SelectVisibilityStatus
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={false}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={false}
            />
        )

        expect(container).toMatchSnapshot()

        fireEvent.click(getAllByText(/Public/)[0])

        fireEvent.click(getByText(/Unlisted/))

        expect(onChange).toHaveBeenLastCalledWith('UNLISTED')
    })

    it('should show the notification popup', () => {
        const {findByText, getByText} = render(
            <SelectVisibilityStatus
                status="PUBLIC"
                onChange={onChange}
                isParentUnlisted={true}
                setShowNotification={setShowNotification}
                type="article"
                showNotification={true}
            />
        )

        expect(findByText(/Got it/)).toBeTruthy()

        fireEvent.click(getByText(/Got it/))

        expect(setShowNotification).toHaveBeenCalled()
    })
})

import {render} from '@testing-library/react'
import React, {MutableRefObject} from 'react'

import useStatefulRef from '../useStatefulRef'

let statefulRef: MutableRefObject<unknown> | undefined

const setStateMock = jest.fn()
// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const useStateMock: any = (useState: any) => [useState, setStateMock]
const spyUseState = jest
    .spyOn(React, 'useState')
    .mockImplementation(useStateMock)

const HookWrapper = ({
    value,
    initialValue,
}: {
    value: unknown
    initialValue: unknown
}) => {
    statefulRef = useStatefulRef(initialValue)
    if (value) {
        statefulRef.current = value
    }
    return null
}

describe('useStatefulRef', () => {
    it('should call useState', () => {
        render(<HookWrapper value={undefined} initialValue={undefined} />)

        expect(spyUseState).toHaveBeenCalled()
    })

    it('should call setState when setting value', () => {
        render(<HookWrapper initialValue="initial" value="newValue" />)

        expect(setStateMock).toHaveBeenCalled()
        expect(statefulRef).toMatchObject({current: 'newValue'})
    })

    it('should not call setState when setting value to same value', () => {
        render(<HookWrapper initialValue="initial" value="initial" />)

        expect(setStateMock).not.toHaveBeenCalled()
    })

    it('should update ref value', () => {
        const {rerender} = render(
            <HookWrapper initialValue="initial" value="initial" />
        )
        expect(statefulRef).toMatchObject({current: 'initial'})

        rerender(<HookWrapper initialValue="initial" value="newValue" />)

        expect(statefulRef).toMatchObject({current: 'newValue'})
    })
})

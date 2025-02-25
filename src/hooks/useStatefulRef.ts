import { MutableRefObject, useRef, useState } from 'react'

// taken from https://non-traditional.dev/creating-a-stateful-ref-object-in-react-fcd56d9dea58
export default function useStatefulRef<T>(initialVal?: T): MutableRefObject<T> {
    // eslint-disable-next-line prefer-const
    let [cur, setCur] = useState<T | undefined>(initialVal)

    const { current: ref } = useRef({
        current: cur,
    })

    Object.defineProperty(ref, 'current', {
        get: () => cur as T,
        set: (value: T) => {
            if (!Object.is(cur, value)) {
                cur = value
                setCur(value)
            }
        },
    })

    return ref as MutableRefObject<T>
}

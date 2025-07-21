import { useEffect } from 'react'

import useRafState from './useRafState'

export default function useWindowSize() {
    const [state, setState] = useRafState({
        width: window.innerWidth,
        height: window.innerHeight,
    })

    useEffect(() => {
        const handler = () => {
            setState({
                width: window.innerWidth,
                height: window.innerHeight,
            })
        }

        window.addEventListener('resize', handler)

        return () => {
            window.removeEventListener('resize', handler)
        }
    }, [setState])

    return state
}

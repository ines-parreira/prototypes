import React, {useEffect, useState, ComponentType} from 'react'

import Loader from '../../Loader/Loader'

import loadAce from './loadAce'
import {ACEProps, EditorProps, WindowWithACE} from './types'

function withACEEditor(Component: ComponentType<any>) {
    function WrappedComponent(props: EditorProps & ACEProps) {
        const [loaded, setLoaded] = useState(false)

        useEffect(() => {
            if (!loaded) {
                loadAce(() => {
                    setLoaded(true)
                })
            }
        }, [loaded])

        if (!loaded) return <Loader minHeight="200px" />

        return <Component {...props} ace={(window as WindowWithACE).ace} />
    }

    return WrappedComponent
}

export default withACEEditor

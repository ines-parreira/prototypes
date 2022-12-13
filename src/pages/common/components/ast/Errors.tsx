import React, {
    useRef,
    useContext,
    createContext,
    ReactNode,
    FunctionComponent,
    CSSProperties,
    useEffect,
    useState,
    useCallback,
} from 'react'
import classnames from 'classnames'
import useId from 'hooks/useId'

export const ErrorsCollector: React.FC = ({children}) => {
    const currentErrors = useRef<Set<string>>(new Set())
    const [errors, setErrors] = useState<Set<string>>(currentErrors.current)

    const addError = useCallback((key: string) => {
        currentErrors.current.add(key)
        setErrors(new Set(currentErrors.current))
    }, [])

    const removeError = useCallback((key: string) => {
        currentErrors.current.delete(key)
        setErrors(new Set(currentErrors.current))
    }, [])

    return (
        <ErrorsContext.Provider value={{errors, addError, removeError}}>
            {children}
        </ErrorsContext.Provider>
    )
}

type Context = {
    errors: Set<string>
    addError: (key: string) => void
    removeError: (key: string) => void
}

export const ErrorsContext = createContext<Context>({
    errors: new Set(),
    addError: () => ({}),
    removeError: () => ({}),
})

type Props = {
    belowInput?: boolean
    className?: string
    children?: ReactNode
    inline?: boolean
    tag?: keyof JSX.IntrinsicElements | FunctionComponent<any>
}

export default function Errors({
    belowInput = false,
    className,
    children,
    inline = false,
    tag: Tag = 'div',
    ...rest
}: Props) {
    const id = useId()
    const {addError, removeError} = useContext(ErrorsContext)

    useEffect(() => {
        addError(id)

        return () => {
            removeError(id)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (!children) {
        return null
    }

    if (inline) {
        return (
            <Tag
                className={classnames(
                    'd-inline-block text-danger ml-2',
                    className
                )}
                {...rest}
            >
                {children}
            </Tag>
        )
    }

    const style: CSSProperties = {}

    // if the error is displayed below an input, make some display adjustments
    if (belowInput) {
        style.marginTop = '-8px'
        style.marginBottom = '.5rem'
    }

    return (
        <Tag
            className={classnames('text-danger', className)}
            style={style}
            {...rest}
        >
            {children}
        </Tag>
    )
}

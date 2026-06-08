import type { ReactNode } from 'react'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react'

import type { ContextAttachment } from '@gorgias/copilot'

type ContextAttachmentRegistration = {
    id: number
    attachment: ContextAttachment
}

type CopilotContextAttachmentContextValue = {
    candidate: ContextAttachment | undefined
    register: (id: number, attachment: ContextAttachment | undefined) => void
    unregister: (id: number) => void
}

const CopilotContextAttachmentContext =
    createContext<CopilotContextAttachmentContextValue>({
        candidate: undefined,
        register: () => undefined,
        unregister: () => undefined,
    })

let nextRegistrationId = 0

export function CopilotContextAttachmentProvider({
    children,
}: {
    children: ReactNode
}) {
    const [registrationStack, setRegistrationStack] = useState<
        ContextAttachmentRegistration[]
    >([])

    const register = useCallback(
        (id: number, attachment: ContextAttachment | undefined) => {
            setRegistrationStack((currentRegistrationStack) => {
                const registrationStackWithoutCurrent =
                    currentRegistrationStack.filter(
                        (registration) => registration.id !== id,
                    )

                if (!attachment) {
                    return registrationStackWithoutCurrent
                }

                return [...registrationStackWithoutCurrent, { id, attachment }]
            })
        },
        [],
    )

    const unregister = useCallback((id: number) => {
        setRegistrationStack((currentRegistrationStack) =>
            currentRegistrationStack.filter(
                (registration) => registration.id !== id,
            ),
        )
    }, [])

    const candidate =
        registrationStack[registrationStack.length - 1]?.attachment

    const value = useMemo(
        () => ({
            candidate,
            register,
            unregister,
        }),
        [candidate, register, unregister],
    )

    return (
        <CopilotContextAttachmentContext.Provider value={value}>
            {children}
        </CopilotContextAttachmentContext.Provider>
    )
}

export function useCopilotContextAttachmentCandidate() {
    return useCopilotContextAttachmentContext().candidate
}

export function useRegisterCopilotContextAttachment(
    attachment: ContextAttachment | undefined,
) {
    const { register, unregister } = useCopilotContextAttachmentContext()
    const registrationIdRef = useRef<number>()

    if (registrationIdRef.current === undefined) {
        nextRegistrationId += 1
        registrationIdRef.current = nextRegistrationId
    }

    useEffect(() => {
        const registrationId = registrationIdRef.current!
        register(registrationId, attachment)

        return () => {
            unregister(registrationId)
        }
    }, [attachment, register, unregister])
}

function useCopilotContextAttachmentContext() {
    return useContext(CopilotContextAttachmentContext)
}

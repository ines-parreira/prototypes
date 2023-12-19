import {UseMutationOptions} from '@tanstack/react-query'

export type MutationOverrides<
    Action extends (...args: any) => unknown,
    SkipReturnType extends boolean = false,
    TContext = unknown,
> = Omit<
    UseMutationOptions<
        SkipReturnType extends true ? unknown : Awaited<ReturnType<Action>>,
        Record<string, unknown>,
        Parameters<Action>,
        TContext
    >,
    'mutationFn'
>

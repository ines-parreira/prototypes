import {Action} from 'redux'

type GorgiasThunkAction<
    TReturnType,
    TState,
    TExtraThunkArg,
    TBasicAction extends Action
> = (
    dispatch: GorgiasThunkDispatch<TState, TExtraThunkArg, TBasicAction>,
    getState: () => TState,
    extraArgument: TExtraThunkArg
) => TReturnType

type GorgiasThunkDispatch<
    TState,
    TExtraThunkArg,
    TBasicAction extends Action
> = {
    <TReturnType>(
        thunkAction: GorgiasThunkAction<
            TReturnType,
            TState,
            TExtraThunkArg,
            TBasicAction
        >
    ): TReturnType
    <A extends TBasicAction>(action: A): A
    <TReturnType, TAction extends TBasicAction>(
        action:
            | TAction
            | GorgiasThunkAction<
                  TReturnType,
                  TState,
                  TExtraThunkArg,
                  TBasicAction
              >
    ): TAction | TReturnType
}

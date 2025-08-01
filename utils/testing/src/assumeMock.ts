export const assumeMock = <TFunction extends (...args: any[]) => any>(
    mock: TFunction,
): jest.MockedFunction<TFunction> => {
    return mock as jest.MockedFunction<TFunction>
}

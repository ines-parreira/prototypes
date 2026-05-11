export const assumeMock = <TFunction extends (...args: any[]) => any>(
    mock: TFunction | (new (...args: any[]) => any),
): jest.MockedFunction<TFunction> => {
    return mock as unknown as jest.MockedFunction<TFunction>
}

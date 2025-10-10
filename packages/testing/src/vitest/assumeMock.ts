export const assumeMock = <TFunction extends (...args: any[]) => any>(
    mock: TFunction,
) => {
    return mock as any
}

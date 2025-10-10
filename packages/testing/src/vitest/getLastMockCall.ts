export const getLastMockCall = <TFunction extends (...args: any[]) => any>(
    mockedFunction: TFunction & { mock: { calls: any[][] } },
) => mockedFunction.mock.calls.slice(-1)[0]

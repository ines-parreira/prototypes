export const getLastMockCall = <TFunction extends (...args: any[]) => any>(
    mockedFunction: jest.MockedFunction<TFunction>,
) => mockedFunction.mock.calls.slice(-1)[0]

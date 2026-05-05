type MockWithCalls<TFunction extends (...args: any[]) => any> = {
    mock: {
        calls: Parameters<TFunction>[]
    }
}

export const getLastMockCall = <TFunction extends (...args: any[]) => any>(
    mockedFunction: MockWithCalls<TFunction>,
) => mockedFunction.mock.calls.slice(-1)[0]

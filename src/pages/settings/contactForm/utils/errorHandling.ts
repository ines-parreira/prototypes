export async function catchAsync<TFunction extends () => Promise<any>>(
    func: TFunction
): Promise<[undefined, ReturnType<TFunction>] | [Error]> {
    try {
        const result = await func()
        return [undefined, result]
    } catch (error) {
        return [error]
    }
}

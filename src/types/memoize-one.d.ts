//$TsFixMe stub of 'memoize-one' definition is included with the next dependency update
declare module 'memoize-one' {
    function memoize<
        ResultFn extends (this: any, ...newArgs: any[]) => ReturnType<ResultFn>
    >(
        resultFn: ResultFn,
        isEqual?: (newArgs: any[], lastArgs: any[]) => boolean
    ): ResultFn

    export = memoize
}

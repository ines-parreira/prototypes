import {AppErrorLog} from 'models/integration/types/app'

export const dummyErrorLogList: AppErrorLog[] = [
    {
        error: 'Test error',
        payload: {test: 'Test value'},
        created_datetime: '2022-01-17T18:20:50.067Z',
    },
    {
        error: 'Test error 2',
        payload: null,
        created_datetime: '2022-02-17T18:20:50.067Z',
    },
    {
        error: 'Test error 3',
        payload: {test: 'Test value 3'},
        created_datetime: '2022-03-17T18:20:50.067Z',
    },
]

export const dummyErrorLog: AppErrorLog = dummyErrorLogList[0]

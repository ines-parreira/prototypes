import {Map} from 'immutable'

export type CustomersState = Map<any, any>

export type CustomerExternalData = {
    [key in string | number]: Record<string, any> & {__app_name__: string}
}

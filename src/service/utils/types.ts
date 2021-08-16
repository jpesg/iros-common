export type ServiceName
    = 'user'
    | 'dialer'
    | 'lookup'
    | 'mail'
    | 'ogi'
    | 'text'
    | 'tinyUrl'

export type ServiceConfigFunc = (config:  Record<string, unknown>, app_name: string) => void;

export type Service = { 
    configure: ServiceConfigFunc
}

// the only way to ensure each value in the map has a configure func is through CIFs
// see https://kentcdodds.com/blog/how-to-write-a-constrained-identity-function-in-typescript
export const servicesMapBuilder = <M extends Record<ServiceName, Service>>(services: M) => services;

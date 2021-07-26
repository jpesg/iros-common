export type ServiceName
    = 'user'
    | 'dialer'
    | 'lookup'
    | 'mail'
    | 'ogi'
    | 'text'
    | 'tinyUrl'

export type ServiceConfigFunc = (config:  Record<string, unknown>, app_name: string) => void

export type Service = {
    configure: ServiceConfigFunc
    [key: string]: unknown
}

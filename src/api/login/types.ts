export interface LoginRequestType {
  name: string
  email: string
  password: string
}

export interface RegisterRequestType {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponseType {
  message: string
  token: string
}

export interface LoginResponseType {
  message: string
  token: string
}

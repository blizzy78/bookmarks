import { CustomError } from 'ts-custom-error'

export class HTTPError extends CustomError {
  public constructor(public status: number, public statusText: string) {
    super(statusText)
  }
}

export const getJSON = <T>(url: string): Promise<T | undefined> => fetchJSON(url, 'GET')

export const putJSON = <T, D>(url: string, data: D): Promise<T | undefined> => fetchJSON(url, 'PUT', data)

export const postJSON = <T, D>(url: string, data: D): Promise<T | undefined> => fetchJSON(url, 'POST', data)

export const deleteJSON = <T>(url: string): Promise<T | undefined> => fetchJSON(url, 'DELETE')

const fetchJSON = async <T, D = never>(url: string, method: string, data?: D): Promise<T | undefined> => {
  const reqData = {
    method: method,
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    }
  } as RequestInit

  if (data) {
    reqData.body = JSON.stringify(data)
  }

  const res = await fetch(url, reqData)

  if (!res.ok) {
    throw new HTTPError(res.status, res.statusText)
  }

  // 204 No Content
  if (res.status === 204) {
    return Promise.resolve(undefined)
  }

  return res.json() as Promise<T>
}

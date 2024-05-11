import { FastifyReply } from 'fastify'

type HTTPCodeType =
  | 'info'
  | 'success'
  | 'redirect'
  | 'client error'
  | 'server error'

interface InfoOrRedirectBody {
  message: string
}

interface SuccessBody {
  data: object
}

interface ErrorBody {
  error: {
    message: string
  }
}

type ReplyBody = InfoOrRedirectBody | SuccessBody | ErrorBody

/**
 * Represents an HTTP status code.
 */
class HTTPCode {
  private static readonly HTTP_INFO = 100
  private static readonly HTTP_SUCCESS = 200
  private static readonly HTTP_REDIRECT = 300
  private static readonly HTTP_CLIENT_ERROR = 400
  private static readonly HTTP_SERVER_ERROR = 500

  private _code: number
  private _type: HTTPCodeType

  /**
   * Creates an instance of the HTTPCode class.
   *
   * @param code - The HTTP status code.
   * @throws {TypeError} If the code is not in the range 100 to 599.
   */
  constructor(code: number) {
    if (Number.isInteger(code) && code >= 100 && code < 600) {
      this._code = code
    } else {
      throw new TypeError('The code must be in the range 100 to 599')
    }
    this._type = this._setType()
  }

  private _setType(): HTTPCodeType {
    if (
      this._code >= HTTPCode.HTTP_INFO &&
      this._code < HTTPCode.HTTP_SUCCESS
    ) {
      return 'info'
    }
    if (
      this._code >= HTTPCode.HTTP_SUCCESS &&
      this._code < HTTPCode.HTTP_REDIRECT
    ) {
      return 'success'
    }
    if (
      this._code >= HTTPCode.HTTP_REDIRECT &&
      this._code < HTTPCode.HTTP_CLIENT_ERROR
    ) {
      return 'redirect'
    }
    if (
      this._code >= HTTPCode.HTTP_CLIENT_ERROR &&
      this._code < HTTPCode.HTTP_SERVER_ERROR
    ) {
      return 'client error'
    }
    if (this._code >= HTTPCode.HTTP_SERVER_ERROR && this._code < 600) {
      return 'info'
    }
    throw Error('Invalid HTTP code')
  }

  /**
   * Gets the HTTP status code.
   */
  public get code() {
    return this._code
  }

  /**
   * Gets the type of the HTTP status code.
   */
  public get type() {
    return this._type
  }
}

class InfoOrRedirectBodyError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }
}

class SuccessBodyError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }
}

class ErrorBodyError extends Error {
  constructor(message?: string, options?: ErrorOptions) {
    super(message, options)
  }
}

/**
 * Represents a conventional reply object.
 */
export default class ConventionalReply {
  private _code: HTTPCode
  private _body: ReplyBody

  /**
   * Creates a new ConventionalReply instance.
   *
   * @param code The HTTP status code.
   * @param body The reply body.
   */
  constructor(code: number, body: ReplyBody) {
    this._code = new HTTPCode(code)

    this._validateBody(body)

    this._body = body
  }

  /**
   * Validates the reply body based on the HTTP status code.
   *
   * @param body The reply body to validate.
   * @throws {InfoOrRedirectBodyError} If the body is missing the 'message' property for info or redirect codes.
   * @throws {SuccessBodyError} If the body is missing the 'data' property for success codes.
   * @throws {ErrorBodyError} If the body is missing the 'error' property with 'message' property for error codes.
   */
  private _validateBody(body: ReplyBody) {
    if (
      (this._code.type === 'info' || this._code.type === 'redirect') &&
      !('message' in body)
    ) {
      throw new InfoOrRedirectBodyError(
        "Body must have 'message' string property"
      )
    }
    if (this._code.type === 'success' && !('data' in body)) {
      throw new SuccessBodyError("Body must have 'data' object property")
    }
    if (
      (this._code.type === 'client error' ||
        this._code.type === 'server error') &&
      !('error' in body && 'message' in body.error)
    ) {
      throw new ErrorBodyError(
        "Body must have 'error' object property with 'message' string property"
      )
    }
  }

  /**
   * Sends the reply using the provided FastifyReply object.
   *
   * @param reply The FastifyReply object to send the reply.
   * @returns The FastifyReply object.
   */
  public send(reply: FastifyReply) {
    return reply.code(this._code.code).send(this._body)
  }
}

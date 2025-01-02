export const ApiErrorTypes_arr = [
  'NOT_FOUND',
  'BAD_REQUEST',
  'USER_NOT_EXIST',
  'FORBIDDEN',
  'UNAUTHORIZED',
  'JWT_EXPIRED',
  'JWT_REVOKED',
  'SERVER_ERROR',
  'RATE_LIMITED',
  'QUESTION_BLOCKED',
  'CAN_NOT_BLOCK_YOURSELF',
  'NOT_YOUR_QUESTION',
  'NOT_YOUR_ANSWER',
  'USER_NOT_ACCEPT_NEW_QUESTION',
  'USER_NOT_ACCEPT_ANONYMOUS_QUESTION',
  'YOU_MUST_LOGIN_TO_NON_ANONYMOUS_QUESTION',
  'MISSKEY_ERROR',
  'MASTODON_ERROR',
  'REMOTE_SERVER_UNKNOWN_ERROR',
  'REMOTE_MEDIA_TOO_LARGE',
  'REMOTE_ACCESS_TOKEN_REVOKED',
] as const;

export type ApiErrorTypes = (typeof ApiErrorTypes_arr)[number];
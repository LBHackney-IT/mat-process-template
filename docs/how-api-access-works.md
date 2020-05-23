# How API access works

We have two APIs we need to access for this process:

- MaT API
- Process API

## MaT API

When our index page is opened it expects to be sent two strings for MaT API
access as URL query parameters:

- `matApiJwt`
- `data`

`matApiJwt` is a JWT that is passed through to our server when making requests
to check that the request is authorized. We verify it using the
`MAT_API_JWT_SECRET` environment variable.

`data` is an encrypted JSON string that contains secrets used to make requests
to the MaT API. We decrypt it on our server during a request using the
`MAT_API_DATA_*` environment variables.

The MaT API requests are authorized by an `Authorization` header containing a
bearer token. This token is contained in `data` as `matApiToken`.

## Process API

When our index page is opened it expects to be sent a JWT as a URL query
parameter: `processApiJwt`. This JWT is is passed through to our server when
making requests to check that the request is authorized. We verify it using the
`PROCESS_API_JWT_SECRET` environment variable.

We authorize the requests to the Process API with an `X-API-KEY` header
containing the `PROCESS_API_KEY` environment variable.

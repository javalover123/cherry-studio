import { readJsonFile, readTextFile, writeJsonFile, writeTextFile } from '@main/utils/oauth'
import { OAuthClientProvider } from '@modelcontextprotocol/sdk/client/auth'
import {
  OAuthClientInformation,
  OAuthClientInformationFull,
  OAuthClientInformationSchema,
  OAuthTokens,
  OAuthTokensSchema
} from '@modelcontextprotocol/sdk/shared/auth.js'
import Logger from 'electron-log'
import EventEmitter from 'events'
import http from 'http'
import open from 'open'
import { URL } from 'url'

/**
 * OAuth callback server setup options
 */
export interface OAuthCallbackServerOptions {
  /** Port for the callback server */
  port: number
  /** Path for the callback endpoint */
  path: string
  /** Event emitter to signal when auth code is received */
  events: EventEmitter
}

/**
 * Options for creating an OAuth client provider
 */
export interface OAuthProviderOptions {
  /** Server URL to connect to */
  serverUrlHash: string
  /** Port for the OAuth callback server */
  callbackPort: number
  /** Path for the OAuth callback endpoint */
  callbackPath?: string
  /** Directory to store OAuth credentials */
  configDir?: string
  /** Client name to use for OAuth registration */
  clientName?: string
  /** Client URI to use for OAuth registration */
  clientUri?: string
}

export class MCPoAuthClientProvider implements OAuthClientProvider {
  private serverUrlHash: string
  private callbackPath: string
  private callbackPort: number
  private clientUri: string
  private clientName: string

  constructor(readonly options: OAuthProviderOptions) {
    this.serverUrlHash = options.serverUrlHash
    this.callbackPort = options.callbackPort || 12346
    this.callbackPath = options.callbackPath || '/oauth/callback'
    this.clientName = options.clientName || 'Cherry Studio'
    this.clientUri = options.clientUri || 'https://github.com/CherryHQ/cherry-studio'
  }

  get redirectUrl(): string {
    return `http://localhost:${this.callbackPort}${this.callbackPath}`
  }

  get clientMetadata(): {
    redirect_uris: string[]
    scope?: string | undefined
    token_endpoint_auth_method?: string | undefined
    grant_types?: string[] | undefined
    response_types?: string[] | undefined
    client_name?: string | undefined
    client_uri?: string | undefined
    logo_uri?: string | undefined
    contacts?: string[] | undefined
    tos_uri?: string | undefined
    policy_uri?: string | undefined
    jwks_uri?: string | undefined
    jwks?: any
    software_id?: string | undefined
    software_version?: string | undefined
  } {
    return {
      redirect_uris: [this.redirectUrl],
      token_endpoint_auth_method: 'none',
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      client_name: this.clientName,
      client_uri: this.clientUri
    }
  }

  clientInformation(): OAuthClientInformation | undefined | Promise<OAuthClientInformation | undefined> {
    return readJsonFile<OAuthClientInformation>(this.serverUrlHash, 'client_info.json', OAuthClientInformationSchema)
  }

  async saveClientInformation?(clientInformation: OAuthClientInformationFull): Promise<void> {
    await writeJsonFile(this.serverUrlHash, 'client_info.json', clientInformation)
  }

  async tokens(): Promise<OAuthTokens | undefined> {
    return readJsonFile<OAuthTokens>(this.serverUrlHash, 'tokens.json', OAuthTokensSchema)
  }

  async saveTokens(tokens: OAuthTokens): Promise<void> {
    await writeJsonFile(this.serverUrlHash, 'tokens.json', tokens)
  }

  async redirectToAuthorization(authorizationUrl: URL): Promise<void> {
    try {
      // Open the browser to the authorization URL
      await open(authorizationUrl.toString())
      Logger.info('Browser opened automatically.')
    } catch (error) {
      Logger.error('Could not open browser automatically. Please copy and paste the URL above into your browser.')
    }
  }

  async saveCodeVerifier(codeVerifier: string): Promise<void> {
    await writeTextFile(this.serverUrlHash, 'code_verifier.txt', codeVerifier)
  }

  async codeVerifier(): Promise<string> {
    return await readTextFile(this.serverUrlHash, 'code_verifier.txt', 'No code verifier saved for session')
  }

  /**
   * Creates an HTTP server to handle OAuth callback requests
   * @param options The server options
   * @returns The HTTP server instance
   */
  async createCallbackServer(options: OAuthCallbackServerOptions): Promise<http.Server> {
    const { port, path, events } = options
    // Create a simple HTTP server
    const server = http.createServer((req, res) => {
      // Only handle requests to the callback path
      if (req.url?.startsWith(path)) {
        try {
          // Parse the URL to extract the authorization code
          const url = new URL(req.url, `http://localhost:${port}`)
          const code = url.searchParams.get('code')
          if (code) {
            // Emit the code event
            events.emit('auth-code-received', code)
          }
        } catch (error) {
          Logger.error('Error processing OAuth callback:', error)
          res.writeHead(500, { 'Content-Type': 'text/plain' })
          res.end('Internal Server Error')
        }
      } else {
        // Not a callback request
        res.writeHead(404, { 'Content-Type': 'text/plain' })
        res.end('Not Found')
      }
    })

    // Handle server errors
    server.on('error', (error) => {
      Logger.error('OAuth callback server error:', error)
    })

    const runningServer = new Promise<http.Server>((resolve, reject) => {
      server.listen(port, () => {
        Logger.info(`OAuth callback server listening on port ${port}`)
        resolve(server)
      })

      server.on('error', (error) => {
        reject(error)
      })
    })
    return runningServer
  }

  async waitForAuthCode(events: EventEmitter): Promise<string> {
    return new Promise((resolve) => {
      events.once('auth-code-received', (code) => {
        resolve(code)
      })
    })
  }
}

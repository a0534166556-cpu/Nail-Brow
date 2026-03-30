import serverless from 'serverless-http'
import { connectLambda } from '@netlify/blobs'
import { createApp } from '../../server/app.mjs'

process.env.NETLIFY_STORAGE = 'blobs'

const app = createApp({ enableStatic: false })
const handlerInner = serverless(app)

export const handler = async (event, context) => {
  connectLambda(event)
  return handlerInner(event, context)
}

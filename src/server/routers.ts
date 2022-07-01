import Router from 'koa-router'
import { checkDelivery, notifyAuthorization, parseMessage } from './parse.js'
export default function initRouter (prefix: string): Router {

  const router = new Router()

  router.get(prefix + '/notifyPath', notifyAuthorization)

  router.post(prefix + '/delivery/message', parseMessage)

  router.post(prefix + '/delivery/status', checkDelivery)

  return router
}

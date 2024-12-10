import { Logger } from '@/utils/logger/Logger';
import { randomUUID, UUID } from 'crypto';
import { IncomingMessage } from 'http';
import { WebSocket } from 'ws';
import { jwtPayloadType } from '../../_utils/jwt/jwtPayloadType';
import RE2 from 're2';
import { verifyToken } from '../../_utils/jwt/verify-jwt';
import { RedisPubSubService } from '@/app/api/_service/redis-pubsub/redis-event.service';
import {
  QeustionCreatedPayload,
  QuestionDeletedPayload,
  WebsocketEventPayload,
  WebsocketKeepAliveEvent,
  WebsocketQuestionCreatedEvent,
  WebsocketQuestionDeletedEvent,
} from '@/app/_dto/websocket-event/websocket-event.dto';

let instance: WebsocketService;
type ClientList = {
  id: UUID;
  user?: jwtPayloadType['handle'];
  ws: WebSocket;
}[];
export class WebsocketService {
  private logger = new Logger('WebsocketService');
  private clientList: ClientList = [];
  private constructor() {
    this.onConnect = this.onConnect.bind(this);
    const eventService = RedisPubSubService.getInstance();

    eventService.sub<QeustionCreatedPayload>('question-created-event', (data) => {
      this.logger.debug(`Got Event question-created-even`);
      this.sendToUser<QeustionCreatedPayload>(data.questioneeHandle, {
        ev_name: 'question-created-event',
        data: data,
      });
    });

    eventService.sub<QuestionDeletedPayload>('question-deleted-event', (data) => {
      this.logger.debug(`Got Event question-deleted-event`);
      this.sendToUser<QuestionDeletedPayload>(data.handle, {
        ev_name: 'question-deleted-event',
        data: data,
      });
    });
  }
  public static getInstance() {
    if (!instance) {
      instance = new WebsocketService();
    }
    return instance;
  }
  async onConnect(ws: WebSocket, req: IncomingMessage) {
    const id = randomUUID();
    const cookie = req.headers.cookie;
    this.logger.debug(cookie);
    const re = new RE2('(?:jwtToken=)(.+)(?:;)');
    const token = re.match(cookie ?? '')?.[1];
    let tokenBody;
    try {
      tokenBody = await verifyToken(token);
    } catch {}

    this.logger.log(`new Websocket Client ${id} Connected`);
    this.clientList.push({
      id: id,
      ws: ws,
      user: tokenBody?.handle,
    });
    const helloData: WebsocketKeepAliveEvent = {
      ev_name: 'keep-alive',
      data: `Hello ${id}`,
    };
    ws.send(JSON.stringify(helloData));
    setInterval(() => {
      const keepAliveData: WebsocketKeepAliveEvent = {
        ev_name: 'keep-alive',
        data: `Ping ${Date.now()}`,
      };
      ws.send(JSON.stringify(keepAliveData));
    }, 5000);
    this.logger.debug(
      `Client List`,
      this.clientList.map((v) => {
        return { id: v.id, user: v.user };
      }),
    );

    ws.on('close', (_code, _reason) => {
      this.logger.debug('bye', id);
      this.clientList.forEach((c, i) => {
        if (c.id === id) {
          this.clientList.splice(i, 1);
        }
      });
      this.logger.debug(
        `Client List`,
        this.clientList.map((v) => {
          return { id: v.id, user: v.user };
        }),
      );
    });
    ws.on('message', (data, _isBinary) => {
      this.logger.debug(`Client ${id} say`, data.toString());
    });
  }
  public sendToUser<T>(handle: string, data: WebsocketEventPayload<T>) {
    this.clientList.forEach((c) => {
      if (c.user === handle) {
        c.ws.send(JSON.stringify(data));
      }
    });
  }
  public sendToAll<T>(data: WebsocketEventPayload<T>) {
    this.clientList.forEach((c) => {
      c.ws.send(JSON.stringify(data));
    });
  }
}

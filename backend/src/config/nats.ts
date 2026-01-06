import { connect, NatsConnection, JSONCodec, StringCodec } from 'nats';
import { config } from './env';

let natsConnection: NatsConnection | null = null;
export const jsonCodec = JSONCodec();
export const stringCodec = StringCodec();

export const getNatsConnection = async (): Promise<NatsConnection> => {
  if (!natsConnection || !natsConnection.isClosed()) {
    try {
      natsConnection = await connect({
        servers: config.nats.servers,
        reconnect: true,
        maxReconnectAttempts: 10,
        reconnectTimeWait: 2000,
        name: 'classpulse-backend',
      });

      console.log('✅ NATS connected');

      natsConnection.closed().then(() => {
        console.log('⚠️ NATS connection closed');
        natsConnection = null;
      });
    } catch (error) {
      console.error('❌ NATS connection error:', error);
      throw error;
    }
  }

  return natsConnection;
};

export const closeNats = async (): Promise<void> => {
  if (natsConnection && !natsConnection.isClosed()) {
    await natsConnection.close();
    natsConnection = null;
  }
};

// Event publishing helper
export const publishEvent = async (subject: string, data: any): Promise<void> => {
  try {
    const nc = await getNatsConnection();
    const encoded = jsonCodec.encode(data);
    nc.publish(subject, encoded);
  } catch (error) {
    console.error('NATS publish error:', error);
  }
};

// Event subscription helper
export const subscribeToEvent = async (
  subject: string,
  callback: (data: any) => void | Promise<void>
): Promise<void> => {
  try {
    const nc = await getNatsConnection();
    const sub = nc.subscribe(subject);
    
    (async () => {
      for await (const msg of sub) {
        try {
          const data = jsonCodec.decode(msg.data);
          await callback(data);
        } catch (error) {
          console.error('Error processing NATS message:', error);
        }
      }
    })();
  } catch (error) {
    console.error('NATS subscribe error:', error);
  }
};

// Event subjects
export const NATS_SUBJECTS = {
  NOTIFICATION: 'classpulse.notification',
  QUESTION_CREATED: 'classpulse.question.created',
  QUESTION_UPDATED: 'classpulse.question.updated',
  ANSWER_CREATED: 'classpulse.answer.created',
  ANSWER_UPDATED: 'classpulse.answer.updated',
  SUPPORT_TICKET_CREATED: 'classpulse.support.created',
  SUPPORT_TICKET_UPDATED: 'classpulse.support.updated',
  USER_ACTIVITY: 'classpulse.user.activity',
} as const;


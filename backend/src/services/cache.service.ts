import { cache } from '../config/redis';
import { config } from '../config/env';

export class CacheService {
  // Question caching
  static async getQuestion(questionId: string) {
    return cache.get(`question:${questionId}`);
  }

  static async setQuestion(questionId: string, data: any) {
    await cache.set(`question:${questionId}`, data, config.cache.ttl.questions);
  }

  static async invalidateQuestion(questionId: string) {
    await cache.del(`question:${questionId}`);
    await cache.delPattern(`questions:list:*`);
  }

  static async getQuestionsList(key: string) {
    return cache.get(`questions:list:${key}`);
  }

  static async setQuestionsList(key: string, data: any) {
    await cache.set(`questions:list:${key}`, data, config.cache.ttl.questions);
  }

  // Answer caching
  static async getAnswer(answerId: string) {
    return cache.get(`answer:${answerId}`);
  }

  static async setAnswer(answerId: string, data: any) {
    await cache.set(`answer:${answerId}`, data, config.cache.ttl.answers);
  }

  static async invalidateAnswer(answerId: string, questionId: string) {
    await cache.del(`answer:${answerId}`);
    await cache.del(`question:${questionId}`);
    await cache.delPattern(`answers:question:${questionId}*`);
  }

  // User caching
  static async getUser(userId: string) {
    return cache.get(`user:${userId}`);
  }

  static async setUser(userId: string, data: any) {
    await cache.set(`user:${userId}`, data, config.cache.ttl.user);
  }

  static async invalidateUser(userId: string) {
    await cache.del(`user:${userId}`);
  }

  // Notes caching
  static async getNote(noteId: string) {
    return cache.get(`note:${noteId}`);
  }

  static async setNote(noteId: string, data: any) {
    await cache.set(`note:${noteId}`, data, config.cache.ttl.notes);
  }

  static async invalidateNote(noteId: string) {
    await cache.del(`note:${noteId}`);
    await cache.delPattern(`notes:list:*`);
  }

  // Support ticket caching
  static async getTicket(ticketId: string) {
    return cache.get(`ticket:${ticketId}`);
  }

  static async setTicket(ticketId: string, data: any) {
    await cache.set(`ticket:${ticketId}`, data, 300); // 5 minutes
  }

  static async invalidateTicket(ticketId: string) {
    await cache.del(`ticket:${ticketId}`);
    await cache.delPattern(`tickets:list:*`);
  }
}


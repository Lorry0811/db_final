import { MessageRepository } from '@/lib/repositories/message.repository';
import { Database } from '@/types/database.types';

type MessageInsert = Database['public']['Tables']['message']['Insert'];
type MessageUpdate = Database['public']['Tables']['message']['Update'];

export class MessageService {
  private messageRepo = new MessageRepository();

  /**
   * 發送私訊
   */
  async sendMessage(message: MessageInsert) {
    // 檢查不能發送給自己
    if (message.sender_id === message.receiver_id) {
      throw new Error('不能發送私訊給自己');
    }

    return this.messageRepo.create(message);
  }

  /**
   * 取得使用者的所有私訊
   */
  async getUserMessages(userId: number, options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    return this.messageRepo.findByUserId(userId, options);
  }

  /**
   * 取得兩個使用者之間的對話
   */
  async getConversation(userId1: number, userId2: number, options?: {
    page?: number;
    limit?: number;
  }) {
    return this.messageRepo.findConversation(userId1, userId2, options);
  }

  /**
   * 取得單一私訊
   */
  async getMessageById(msgId: number) {
    return this.messageRepo.findById(msgId);
  }

  /**
   * 標記私訊為已讀
   */
  async markAsRead(msgId: number) {
    return this.messageRepo.markAsRead(msgId);
  }

  /**
   * 標記與特定使用者的所有私訊為已讀
   */
  async markConversationAsRead(userId: number, otherUserId: number) {
    return this.messageRepo.markConversationAsRead(userId, otherUserId);
  }

  /**
   * 取得未讀私訊數量
   */
  async getUnreadCount(userId: number): Promise<number> {
    return this.messageRepo.getUnreadCount(userId);
  }

  /**
   * 取得使用者的對話列表
   */
  async getConversationList(userId: number) {
    return this.messageRepo.getConversationList(userId);
  }
}


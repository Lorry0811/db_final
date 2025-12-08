import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

type Message = Database['public']['Tables']['message']['Row'];
type MessageInsert = Database['public']['Tables']['message']['Insert'];
type MessageUpdate = Database['public']['Tables']['message']['Update'];

export class MessageRepository {
  // 新增私訊
  async create(message: MessageInsert) {
    const { data, error } = await supabaseAdmin
      .from('message')
      .insert(message)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢使用者的所有私訊（作為發送者或接收者）
  async findByUserId(userId: number, options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }) {
    let query = supabaseAdmin
      .from('message')
      .select(`
        *,
        sender:sender_id(u_id, username, email),
        receiver:receiver_id(u_id, username, email)
      `)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    if (options?.unreadOnly) {
      query = query.eq('is_read', false).eq('receiver_id', userId);
    }

    query = query.order('sent_time', { ascending: false });

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  // 查詢兩個使用者之間的對話
  async findConversation(userId1: number, userId2: number, options?: {
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('message')
      .select(`
        *,
        sender:sender_id(u_id, username, email),
        receiver:receiver_id(u_id, username, email)
      `)
      .or(`and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
      .order('sent_time', { ascending: true });

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  // 查詢單一私訊
  async findById(msgId: number) {
    const { data, error } = await supabaseAdmin
      .from('message')
      .select(`
        *,
        sender:sender_id(u_id, username, email),
        receiver:receiver_id(u_id, username, email)
      `)
      .eq('msg_id', msgId)
      .single();

    if (error) throw error;
    return data;
  }

  // 標記私訊為已讀
  async markAsRead(msgId: number) {
    const { data, error } = await supabaseAdmin
      .from('message')
      .update({ is_read: true })
      .eq('msg_id', msgId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // 標記與特定使用者的所有私訊為已讀
  async markConversationAsRead(userId: number, otherUserId: number) {
    const { error } = await supabaseAdmin
      .from('message')
      .update({ is_read: true })
      .eq('receiver_id', userId)
      .eq('sender_id', otherUserId)
      .eq('is_read', false);

    if (error) throw error;
  }

  // 取得未讀私訊數量
  async getUnreadCount(userId: number): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('message')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  // 取得使用者的對話列表（每個對話只顯示最新一條訊息）
  async getConversationList(userId: number) {
    // 使用 SQL 查詢獲取每個對話的最新訊息
    const { data, error } = await supabaseAdmin.rpc('get_user_conversations', {
      p_user_id: userId,
    });

    if (error) {
      // 如果 RPC 函數不存在，使用應用層邏輯
      const { data: allMessages, error: fetchError } = await supabaseAdmin
        .from('message')
        .select(`
          *,
          sender:sender_id(u_id, username, email),
          receiver:receiver_id(u_id, username, email)
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('sent_time', { ascending: false });

      if (fetchError) throw fetchError;

      // 處理對話列表
      const conversationMap = new Map<number, any>();
      
      for (const msg of allMessages || []) {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            other_user: msg.sender_id === userId ? msg.receiver : msg.sender,
            last_message: msg,
            unread_count: 0,
          });
        }
        
        // 計算未讀數量
        if (msg.receiver_id === userId && !msg.is_read) {
          const conv = conversationMap.get(otherUserId);
          conv.unread_count = (conv.unread_count || 0) + 1;
        }
      }

      return Array.from(conversationMap.values());
    }

    return data;
  }
}


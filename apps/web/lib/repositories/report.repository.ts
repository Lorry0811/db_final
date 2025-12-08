import { supabaseAdmin } from '@/lib/supabase/admin';
import { Database } from '@/types/database.types';

// 擴展的 Report 類型（包含新增的欄位）
type ReportRow = Database['public']['Tables']['report']['Row'] & {
  report_type?: 'posting' | 'comment' | 'order_violation';
  comment_id?: number | null;
  order_id?: number | null;
  target_user_id?: number | null;
};

type ReportInsert = Omit<Database['public']['Tables']['report']['Insert'], 'p_id'> & {
  report_type: 'posting' | 'comment' | 'order_violation';
  p_id?: number | null;
  comment_id?: number | null;
  order_id?: number | null;
  target_user_id?: number | null;
};

type ReportUpdate = Database['public']['Tables']['report']['Update'] & {
  report_type?: 'posting' | 'comment' | 'order_violation';
  comment_id?: number | null;
  order_id?: number | null;
  target_user_id?: number | null;
};

export class ReportRepository {
  // 新增舉報
  async create(report: ReportInsert) {
    const { data, error } = await supabaseAdmin
      .from('report')
      .insert(report as any)
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, u_id),
        comment:comment_id(comment_id, content, u_id),
        order:order_id(order_id, buyer_id, p_id, deal_price),
        target_user:target_user_id(u_id, username, email)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢使用者的所有舉報
  async findByReporterId(reporterId: number, options?: {
    reportType?: 'posting' | 'comment' | 'order_violation';
    status?: 'pending' | 'approved' | 'rejected';
    page?: number;
    limit?: number;
  }) {
    let query = supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, u_id),
        comment:comment_id(comment_id, content, u_id),
        order:order_id(order_id, buyer_id, p_id, deal_price),
        target_user:target_user_id(u_id, username, email)
      `)
      .eq('reporter_id', reporterId);

    if (options?.reportType) {
      query = query.eq('report_type', options.reportType);
    }

    if (options?.status) {
      query = query.eq('status', options.status);
    }

    query = query.order('created_at', { ascending: false });

    if (options?.page && options?.limit) {
      const from = (options.page - 1) * options.limit;
      const to = from + options.limit - 1;
      query = query.range(from, to);
    }

    const { data, error, count } = await query;

    if (error) throw error;
    return { data, count };
  }

  // 查詢單一舉報
  async findById(reportId: number) {
    const { data, error } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        posting:p_id(p_id, title, u_id),
        comment:comment_id(comment_id, content, u_id),
        order:order_id(order_id, buyer_id, p_id, deal_price),
        target_user:target_user_id(u_id, username, email)
      `)
      .eq('report_id', reportId)
      .single();

    if (error) throw error;
    return data;
  }

  // 查詢特定刊登的所有舉報
  async findByPostingId(postingId: number) {
    const { data, error } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email)
      `)
      .eq('p_id', postingId)
      .eq('report_type', 'posting')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 查詢特定留言的所有舉報
  async findByCommentId(commentId: number) {
    const { data, error } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email)
      `)
      .eq('comment_id', commentId)
      .eq('report_type', 'comment')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 查詢特定訂單的所有舉報
  async findByOrderId(orderId: number) {
    const { data, error } = await supabaseAdmin
      .from('report')
      .select(`
        *,
        reporter:reporter_id(u_id, username, email),
        target_user:target_user_id(u_id, username, email)
      `)
      .eq('order_id', orderId)
      .eq('report_type', 'order_violation')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // 檢查是否已經舉報過（避免重複舉報）
  async checkExistingReport(reporterId: number, reportType: 'posting' | 'comment' | 'order_violation', targetId: number) {
    let query = supabaseAdmin
      .from('report')
      .select('report_id')
      .eq('reporter_id', reporterId)
      .eq('report_type', reportType);

    if (reportType === 'posting') {
      query = query.eq('p_id', targetId);
    } else if (reportType === 'comment') {
      query = query.eq('comment_id', targetId);
    } else if (reportType === 'order_violation') {
      query = query.eq('order_id', targetId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data && data.length > 0;
  }
}


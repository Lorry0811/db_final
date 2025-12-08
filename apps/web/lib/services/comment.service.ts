import { CommentRepository } from '@/lib/repositories/comment.repository';
import { Database } from '@/types/database.types';

type CommentInsert = Database['public']['Tables']['comment']['Insert'];
type CommentUpdate = Database['public']['Tables']['comment']['Update'];

export class CommentService {
  private commentRepo = new CommentRepository();

  /**
   * 新增留言
   */
  async createComment(comment: CommentInsert) {
    return this.commentRepo.create(comment);
  }

  /**
   * 取得刊登的所有留言
   */
  async getPostingComments(postingId: number) {
    return this.commentRepo.findByPostingId(postingId);
  }

  /**
   * 取得單一留言
   */
  async getCommentById(commentId: number) {
    return this.commentRepo.findById(commentId);
  }

  /**
   * 更新留言
   */
  async updateComment(commentId: number, comment: CommentUpdate) {
    return this.commentRepo.update(commentId, comment);
  }

  /**
   * 刪除留言
   */
  async deleteComment(commentId: number) {
    return this.commentRepo.delete(commentId);
  }

  /**
   * 取得刊登的留言數量
   */
  async getCommentCount(postingId: number): Promise<number> {
    return this.commentRepo.getCommentCount(postingId);
  }
}


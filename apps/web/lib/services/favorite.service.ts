import { FavoriteRepository } from '@/lib/repositories/favorite.repository';
import { Database } from '@/types/database.types';

type FavoriteInsert = Database['public']['Tables']['favorite_posts']['Insert'];

export class FavoriteService {
  private favoriteRepo = new FavoriteRepository();

  /**
   * 新增收藏
   */
  async addFavorite(userId: number, postingId: number) {
    return this.favoriteRepo.create({
      u_id: userId,
      p_id: postingId,
    });
  }

  /**
   * 取消收藏
   */
  async removeFavorite(userId: number, postingId: number) {
    return this.favoriteRepo.delete(userId, postingId);
  }

  /**
   * 檢查是否已收藏
   */
  async isFavorited(userId: number, postingId: number): Promise<boolean> {
    return this.favoriteRepo.isFavorited(userId, postingId);
  }

  /**
   * 取得使用者的所有收藏
   */
  async getUserFavorites(userId: number) {
    return this.favoriteRepo.findByUserId(userId);
  }

  /**
   * 取得刊登的收藏數量
   */
  async getFavoriteCount(postingId: number): Promise<number> {
    return this.favoriteRepo.getFavoriteCount(postingId);
  }
}


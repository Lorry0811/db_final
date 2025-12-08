import { PostingRepository } from '@/lib/repositories/posting.repository';
import { Database } from '@/types/database.types';

type PostingInsert = Database['public']['Tables']['posting']['Insert'];
type PostingImageInsert = Database['public']['Tables']['posting_images']['Insert'];

export class PostingService {
  private postingRepo = new PostingRepository();

  /**
   * 搜尋刊登
   */
  async searchPostings(filters: {
    status?: string;
    classId?: number;
    courseId?: number;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }) {
    return this.postingRepo.findMany(filters);
  }

  /**
   * 取得刊登詳情
   */
  async getPostingById(id: number) {
    return this.postingRepo.findById(id);
  }

  /**
   * 取得使用者的刊登
   */
  async getUserPostings(userId: number, status?: string) {
    return this.postingRepo.findByUserId(userId, { status });
  }

  /**
   * 新增刊登（包含圖片）
   */
  async createPosting(
    posting: PostingInsert,
    images?: PostingImageInsert[]
  ) {
    // 建立刊登
    const createdPosting = await this.postingRepo.create(posting);

    // 如果有圖片，新增圖片
    if (images && images.length > 0) {
      const imagePromises = images.map((image, index) =>
        this.postingRepo.addImage({
          p_id: createdPosting.p_id,
          image_url: image.image_url,
          display_order: image.display_order ?? index,
        })
      );
      await Promise.all(imagePromises);
    }

    return createdPosting;
  }

  /**
   * 更新刊登
   */
  async updatePosting(id: number, posting: Partial<PostingInsert>) {
    return this.postingRepo.update(id, posting);
  }

  /**
   * 下架刊登
   */
  async removePosting(id: number) {
    return this.postingRepo.remove(id);
  }

  /**
   * 取得熱門書籍
   */
  async getPopularBooks(limit: number = 10) {
    return this.postingRepo.findPopular(limit);
  }

  /**
   * 新增圖片
   */
  async addImage(image: PostingImageInsert) {
    return this.postingRepo.addImage(image);
  }

  /**
   * 取得刊登的圖片
   */
  async getImages(postingId: number) {
    return this.postingRepo.getImages(postingId);
  }

  /**
   * 刪除圖片
   */
  async deleteImage(imageId: number) {
    return this.postingRepo.deleteImage(imageId);
  }
}


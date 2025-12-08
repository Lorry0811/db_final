// 格式化工具函數

export function formatPrice(price: number | null | undefined): string {
  if (price === null || price === undefined || isNaN(price)) {
    return 'NT$ 0';
  }
  return `NT$ ${price.toLocaleString()}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    listed: '刊登中',
    reserved: '預訂中',
    sold: '已售出',
    reported: '已被檢舉',
    removed: '已下架',
    pending: '待審核',
    approved: '已通過',
    rejected: '已拒絕',
    completed: '已完成',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

export function formatReportType(type: string): string {
  const typeMap: Record<string, string> = {
    posting: '刊登舉報',
    comment: '留言舉報',
    order_violation: '逃單舉報',
  };
  return typeMap[type] || type;
}


const pagination = {
  getPage(req) {
    return parseInt(req.query.page) || 1;
  },

  getLimit(req) {
    return parseInt(req.query.limit) || 10;
  },

  getPagination(req) {
    return {
      page: this.getPage(req),
      limit: this.getLimit(req),
    };
  },

  createPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        totalPages,
        currentPage: page,
        itemsPerPage: limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};

export default pagination;

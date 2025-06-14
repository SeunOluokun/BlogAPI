const mongoose = require('mongoose');

function buildPaginatedQuery({ queryParams, sortableFields = [] }) {
  const {
    page = 1,
    limit = 10,
    sortBy = 'timestamp',
    order = 'desc',
    author,
    title,
    tags,
  } = queryParams;

  const currentPage = parseInt(page, 10);
  const perPage = parseInt(limit, 10);
  const sortOrder = order === 'asc' ? 1 : -1;
  const sortField = sortableFields.includes(sortBy) ? sortBy : 'timestamp';

  const query = {};

  if (author && author !== 'null' && mongoose.Types.ObjectId.isValid(author)) {
        query.author = author;
    } 

  if (title) {
    query.title = { $regex: title, $options: 'i' };
  }

  if (tags) {
    query.tags = { $in: tags.split(',') };
  }

  const pagination = {
    skip: (currentPage - 1) * perPage,
    limit: perPage,
  };

  const sort = {
    [sortField]: sortOrder,
  };

  return {
    query,
    sort,
    pagination,
    currentPage,
  };
}

module.exports = buildPaginatedQuery;

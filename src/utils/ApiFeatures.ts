type QueryString = {
  search?: string;
  limit?: number;
  page?: number;
  filter?: any;
  sort?: string;
};

export default class ApiFeatures {
  private query: any;
  private searchFields: string[];
  private queryString: QueryString;
  /**
   * @param {any} query - The Mongoose query object.
   * @param {QueryString} queryString - The query string containing search, sort, pagination, and filtering parameters.
   * @param {string[]} searchFields - The fields in the document to search against.
   */
  constructor(query: any, queryString: QueryString, searchFields: string[]) {
    this.query = query;
    this.queryString = queryString;
    this.searchFields = searchFields;
    this.search();
    this.sort();
    this.paginating();
  }

  private search() {
    const { search } = this.queryString;
    if (search) {
      const searchQuery = {
        $or: this.searchFields.map((field) => ({
          [field]: { $regex: search, $options: "i" },
        })),
      };
      this.query = this.query.where(searchQuery);
    }
    return this;
  }

  private sort() {
    const { sort } = this.queryString;
    // The sort parameter should be a field name or a field name prefixed with '-' for descending order
    if (sort) {
      this.query = this.query.sort(sort);
    }
    return this;
  }

  private paginating() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 9;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
  }

  countDocuments() {
    return this.query.clone().countDocuments();
  }

  executeQuery() {
    return this.query;
  }
}
